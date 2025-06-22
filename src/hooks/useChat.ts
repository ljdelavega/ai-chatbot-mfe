import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, ChatRequest, WidgetConfig } from '../lib/types';
import { ChatbotApiClient } from '../lib/api';
import { MockChatbotApiClient } from '../lib/mockApi';

export interface UseChatOptions {
  config: WidgetConfig;
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  streamingMessageId: string | null;
  sendMessage: (content: string) => Promise<void>;
  retry: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

// Enhanced streaming configuration
interface StreamingConfig {
  chunkDelay: number; // Delay between chunk processing (ms)
  maxRetries: number; // Maximum retry attempts
  retryDelay: number; // Delay between retries (ms)
  connectionTimeout: number; // Connection timeout (ms)
}

const DEFAULT_STREAMING_CONFIG: StreamingConfig = {
  chunkDelay: 50, // 50ms for smooth but not overwhelming updates
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 30000, // 30 seconds
};

export function useChat({ config, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Enhanced refs for streaming management
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const streamingConfigRef = useRef<StreamingConfig>(DEFAULT_STREAMING_CONFIG);
  const retryCountRef = useRef<number>(0);
  const streamTimeoutRef = useRef<number | null>(null);
  
  // Performance optimization: batch chunk updates
  const pendingChunksRef = useRef<string[]>([]);
  const chunkProcessingTimeoutRef = useRef<number | null>(null);
  
  // Create appropriate API client based on environment
  const createApiClient = useCallback(() => {
    // Use mock API for development testing when using localhost:8000
    if (config.baseUrl.includes('localhost:8000') && import.meta.env.DEV) {
      console.log('🔧 Using Mock API for development testing');
      return new MockChatbotApiClient(config.baseUrl, config.apiKey);
    }
    return new ChatbotApiClient(config.baseUrl, config.apiKey);
  }, [config.baseUrl, config.apiKey]);

  const apiClientRef = useRef(createApiClient());

  // Update API client when config changes
  useEffect(() => {
    const newClient = createApiClient();
    if (apiClientRef.current.baseUrl !== newClient.baseUrl || 
        apiClientRef.current.key !== newClient.key) {
      apiClientRef.current = newClient;
    }
  }, [createApiClient]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsInitialized(false);
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date(),
        status: 'complete'
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized, messages.length]);

  const generateMessageId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, [generateMessageId]);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Enhanced chunk processing with batching for better performance
  const processPendingChunks = useCallback((assistantMessageId: string) => {
    if (pendingChunksRef.current.length === 0) return;

    const chunks = [...pendingChunksRef.current];
    pendingChunksRef.current = [];

    // Batch process all pending chunks
    const combinedChunk = chunks.join('');
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === assistantMessageId) {
        const newContent = (msg.content || '') + combinedChunk;
        return { 
          ...msg, 
          content: newContent,
          status: 'streaming' as const,
          timestamp: new Date()
        };
      }
      return msg;
    }));
  }, []);

  // Enhanced streaming with better error handling and performance
  const handleStreamingResponse = useCallback(async (
    assistantMessageId: string, 
    currentMessages: Message[],
    retryAttempt: number = 0
  ) => {
    try {
      // Clear any existing timeouts
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      if (chunkProcessingTimeoutRef.current) {
        clearTimeout(chunkProcessingTimeoutRef.current);
      }

      // Only include messages that are complete (not loading/streaming)
      const apiMessages = currentMessages
        .filter(msg => msg.status === 'complete')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const chatRequest: ChatRequest = {
        messages: apiMessages
      };

      // Update message to show streaming status
      updateMessage(assistantMessageId, { 
        status: 'streaming'
      });
      
      // Set streaming message ID
      setStreamingMessageId(assistantMessageId);

      // Set connection timeout
      streamTimeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        throw new Error('Connection timeout: The request took too long to complete');
      }, streamingConfigRef.current.connectionTimeout);

      const stream = apiClientRef.current.chatStream(chatRequest);
      let hasReceivedData = false;

      // Process stream with enhanced error handling
      for await (const chunk of stream) {
        // Clear timeout on first successful data
        if (!hasReceivedData) {
          hasReceivedData = true;
          if (streamTimeoutRef.current) {
            clearTimeout(streamTimeoutRef.current);
            streamTimeoutRef.current = null;
          }
        }

        // Check if we were aborted
        if (abortControllerRef.current?.signal.aborted) {
          updateMessage(assistantMessageId, { 
            status: 'error',
            content: 'Request was cancelled.'
          });
          setStreamingMessageId(null);
          break;
        }

        if (chunk.done) {
          // Process any remaining chunks before completing (only for production batching)
          if (pendingChunksRef.current.length > 0 && 
              !config.baseUrl.includes('localhost:8000')) {
            processPendingChunks(assistantMessageId);
            // Small delay to ensure final update is processed
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Stream completed successfully
          updateMessage(assistantMessageId, { 
            status: 'complete',
            timestamp: new Date()
          });
          setStreamingMessageId(null);
          retryCountRef.current = 0; // Reset retry count on success
          break;
        } else {
          // Parse Server-Sent Events format if needed
          let chunkData = chunk.data;
          
          // Handle SSE format: "data: content\n\n"
          if (chunkData.startsWith('data: ')) {
            chunkData = chunkData.slice(6); // Remove "data: " prefix
          }
          
          // Skip empty chunks
          if (!chunkData.trim()) {
            continue;
          }

          // For development/mock API, process chunks immediately
          // For production, use batching for better performance
          if (config.baseUrl.includes('localhost:8000') && import.meta.env.DEV) {
            // Process chunk immediately for mock API to avoid duplication
            setMessages(prev => prev.map(msg => {
              if (msg.id === assistantMessageId) {
                const newContent = (msg.content || '') + chunkData;
                return { 
                  ...msg, 
                  content: newContent,
                  status: 'streaming' as const,
                  timestamp: new Date()
                };
              }
              return msg;
            }));
          } else {
            // Add chunk to pending processing queue for production
            pendingChunksRef.current.push(chunkData);

            // Batch process chunks for better performance
            if (chunkProcessingTimeoutRef.current) {
              clearTimeout(chunkProcessingTimeoutRef.current);
            }

            chunkProcessingTimeoutRef.current = setTimeout(() => {
              processPendingChunks(assistantMessageId);
            }, streamingConfigRef.current.chunkDelay);
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      
      // Clear timeouts on error
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
      if (chunkProcessingTimeoutRef.current) {
        clearTimeout(chunkProcessingTimeoutRef.current);
        chunkProcessingTimeoutRef.current = null;
      }

      let errorMessage = 'Failed to get response';
      let userFriendlyMessage = 'Sorry, I encountered an error. Please try again.';
      let shouldRetry = false;
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Determine if we should retry based on error type
        if (err.message.includes('HTTP 429')) {
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
          shouldRetry = true;
        } else if (err.message.includes('HTTP 5') || err.message.includes('timeout')) {
          userFriendlyMessage = 'The AI service is temporarily unavailable. Retrying...';
          shouldRetry = true;
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          userFriendlyMessage = 'Network error. Please check your connection.';
          shouldRetry = true;
        } else if (err.message.includes('HTTP 401') || err.message.includes('HTTP 403')) {
          userFriendlyMessage = 'Authentication failed. Please check your API key.';
          shouldRetry = false;
        }
      }
      
      // Implement automatic retry for recoverable errors
      if (shouldRetry && 
          retryAttempt < streamingConfigRef.current.maxRetries && 
          !abortControllerRef.current?.signal.aborted) {
        
        console.log(`Retrying stream (attempt ${retryAttempt + 1}/${streamingConfigRef.current.maxRetries})`);
        retryCountRef.current = retryAttempt + 1;
        
        // Update message to show retry status
        updateMessage(assistantMessageId, { 
          status: 'loading',
          content: `Connection interrupted. Retrying... (${retryAttempt + 1}/${streamingConfigRef.current.maxRetries})`
        });
        
        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, streamingConfigRef.current.retryDelay * (retryAttempt + 1))
        );
        
        // Retry the request
        return handleStreamingResponse(assistantMessageId, currentMessages, retryAttempt + 1);
      }
      
      // Update assistant message to show error
      updateMessage(assistantMessageId, { 
        status: 'error',
        content: userFriendlyMessage
      });
      
      setStreamingMessageId(null);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
      
      // Clear all timeouts
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
      if (chunkProcessingTimeoutRef.current) {
        clearTimeout(chunkProcessingTimeoutRef.current);
        chunkProcessingTimeoutRef.current = null;
      }
      
      // Clear pending chunks
      pendingChunksRef.current = [];
    }
  }, [updateMessage, onError, processPendingChunks]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any pending chunk processing
    if (chunkProcessingTimeoutRef.current) {
      clearTimeout(chunkProcessingTimeoutRef.current);
      chunkProcessingTimeoutRef.current = null;
    }
    pendingChunksRef.current = [];

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Store for retry functionality
    lastUserMessageRef.current = content.trim();

    // Clear any previous errors and reset retry count
    setError(null);
    retryCountRef.current = 0;
    setIsLoading(true);

    try {
      // Add user message
      const userMessage = {
        role: 'user' as const,
        content: content.trim(),
        status: 'complete' as const
      };
      
      addMessage(userMessage);

      // Add assistant message with loading state
      const assistantMessage = {
        role: 'assistant' as const,
        content: '',
        status: 'loading' as const
      };
      
      const assistantMessageId = addMessage(assistantMessage);

      // Get current messages for API call
      setMessages(prev => {
        const updatedMessages = [...prev];
        
        // Start streaming response with the updated message list
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          handleStreamingResponse(assistantMessageId, updatedMessages);
        });
        
        return updatedMessages;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
    }
    // Note: setIsLoading(false) is called in handleStreamingResponse finally block
  }, [isLoading, addMessage, handleStreamingResponse, onError]);

  const retry = useCallback(async () => {
    if (lastUserMessageRef.current && !isLoading) {
      console.log('🔄 Retrying last message:', lastUserMessageRef.current);
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage, isLoading]);

  // Enhanced cleanup on unmount
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up chat resources');
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear all timeouts
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    
    if (chunkProcessingTimeoutRef.current) {
      clearTimeout(chunkProcessingTimeoutRef.current);
      chunkProcessingTimeoutRef.current = null;
    }
    
    // Clear pending chunks
    pendingChunksRef.current = [];
    
    // Reset streaming state
    setStreamingMessageId(null);
    setIsLoading(false);
  }, []);

  // Cleanup effect for component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Return enhanced hook interface
  return {
    messages,
    isLoading,
    error,
    streamingMessageId,
    sendMessage,
    retry,
    clearMessages,
    clearError,
    // Internal cleanup method for advanced usage
    _cleanup: cleanup
  } as UseChatReturn & { _cleanup: () => void };
} 