import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, ChatRequest, WidgetConfig, RetryConfig } from '../lib/types';
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
  retryMessage: (messageId: string) => Promise<void>;
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

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableErrors: [
    'HTTP 429', // Rate limit
    'HTTP 5', // Server errors
    'timeout',
    'NetworkError',
    'Failed to fetch'
  ]
};

export function useChat({ config, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for managing streaming and cleanup
  const apiClientRef = useRef<ChatbotApiClient | MockChatbotApiClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  const streamTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Performance optimization: batch chunk updates
  const pendingChunksRef = useRef<string[]>([]);
  const chunkProcessingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enhanced streaming configuration
  const streamingConfigRef = useRef<StreamingConfig>({
    chunkDelay: 50, // 50ms delay for smooth streaming
    maxRetries: 3,
    retryDelay: 1000,
    connectionTimeout: 30000 // 30 seconds
  });

  // Initialize API client
  useEffect(() => {
    const initializeApiClient = async () => {
      try {
        // Use real API if we have environment variables set (indicating user wants real API)
        // OR if we're not in development (localhost) - assume production deployment
        const useRealApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_KEY;
        const isProductionDeployment = !config.baseUrl.includes('localhost') && !config.baseUrl.includes('127.0.0.1');
        
        if (useRealApi || config.baseUrl.includes('localhost:8000') || isProductionDeployment) {
          console.log('🚀 Using Real AI Chatbot API at', config.baseUrl);
          const { ChatbotApiClient } = await import('../lib/api');
          apiClientRef.current = new ChatbotApiClient(config.baseUrl, config.apiKey || undefined);
        } else {
          console.log('🔧 Using Mock API for development testing');
          apiClientRef.current = new MockChatbotApiClient(config.baseUrl, config.apiKey || undefined);
        }
      } catch (err) {
        console.error('Failed to initialize API client:', err);
        setError('Failed to initialize chat service');
      }
    };

    initializeApiClient();
  }, [config.baseUrl, config.apiKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      if (chunkProcessingTimeoutRef.current) {
        clearTimeout(chunkProcessingTimeoutRef.current);
      }
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingMessageId(null);
    setIsInitialized(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

  // Check if error is retryable
  const isRetryableError = useCallback((error: string): boolean => {
    return DEFAULT_RETRY_CONFIG.retryableErrors.some(retryableError => 
      error.toLowerCase().includes(retryableError.toLowerCase())
    );
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
          status: 'streaming',
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

      const stream = apiClientRef.current!.chatStream(chatRequest);
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
            content: 'Request was cancelled.',
            error: 'Request was cancelled'
          });
          setStreamingMessageId(null);
          break;
        }

        if (chunk.done) {
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
          
          // Skip only completely empty chunks, but preserve spaces and whitespace content
          if (chunkData.length === 0) {
            continue;
          }

          // Always process chunks immediately for real-time streaming
          // This ensures content is properly accumulated and rendered
          setMessages(prev => prev.map(msg => {
            if (msg.id === assistantMessageId) {
              const newContent = (msg.content || '') + chunkData;
              return { 
                ...msg, 
                content: newContent,
                status: 'streaming',
                timestamp: new Date()
              };
            }
            return msg;
          }));
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
        
        // Update message status to show retry
        updateMessage(assistantMessageId, { 
          status: 'retrying',
          retryCount: retryAttempt + 1,
          error: userFriendlyMessage
        });
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, streamingConfigRef.current.retryDelay * Math.pow(2, retryAttempt))
        );
        
        // Retry the request
        return handleStreamingResponse(assistantMessageId, currentMessages, retryAttempt + 1);
      }
      
      // Update message with error state
      updateMessage(assistantMessageId, { 
        status: 'error',
        error: userFriendlyMessage,
        canRetry: isRetryableError(errorMessage),
        retryCount: retryAttempt
      });
      
      setStreamingMessageId(null);
      setError(userFriendlyMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  }, [config, updateMessage, processPendingChunks, onError, isRetryableError]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !apiClientRef.current) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Store for retry functionality
    lastUserMessageRef.current = content.trim();

    // Clear any previous errors
    setError(null);
    setIsLoading(true);

    try {
      // Add user message with pending status
      const userMessage = {
        role: 'user' as const,
        content: content.trim(),
        status: 'sending' as const
      };
      
      const userMessageId = addMessage(userMessage);

      // Update user message to complete
      updateMessage(userMessageId, { status: 'complete' });

      // Add assistant message with streaming state
      const assistantMessage = {
        role: 'assistant' as const,
        content: '',
        status: 'streaming' as const
      };
      
      const assistantMessageId = addMessage(assistantMessage);
      
      // Get current messages for API call
      const currentMessages = [...messages, {
        id: userMessageId,
        role: 'user' as const,
        content: content.trim(),
        timestamp: new Date(),
        status: 'complete' as const
      }];

      // Handle streaming response
      await handleStreamingResponse(assistantMessageId, currentMessages);

    } catch (err) {
      console.error('Send message error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, addMessage, updateMessage, handleStreamingResponse, onError]);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || !message.canRetry) return;

    console.log('🔄 Retrying message:', messageId);
    
    // Update message status to retrying
    updateMessage(messageId, { 
      status: 'retrying',
      retryCount: (message.retryCount || 0) + 1
    });

    // Find the corresponding user message to retry
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        // Get messages up to the user message for context
        const contextMessages = messages.slice(0, messageIndex);
        
        try {
          await handleStreamingResponse(messageId, contextMessages);
        } catch (err) {
          console.error('Retry failed:', err);
          updateMessage(messageId, { 
            status: 'error',
            error: 'Retry failed. Please try again.',
            canRetry: true
          });
        }
      }
    }
  }, [messages, updateMessage, handleStreamingResponse]);

  const retry = useCallback(async () => {
    if (lastUserMessageRef.current && !isLoading) {
      console.log('🔄 Retrying last message:', lastUserMessageRef.current);
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage, isLoading]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      if (chunkProcessingTimeoutRef.current) {
        clearTimeout(chunkProcessingTimeoutRef.current);
      }
    };
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

  return {
    messages,
    isLoading,
    error,
    streamingMessageId,
    sendMessage,
    retryMessage,
    retry,
    clearMessages,
    clearError
  };
} 