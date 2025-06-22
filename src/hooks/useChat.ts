import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, ChatRequest, WidgetConfig, StreamChunk } from '../lib/types';
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

export function useChat({ config, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Keep refs for cleanup and retry functionality
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  
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

  const handleStreamingResponse = useCallback(async (assistantMessageId: string, currentMessages: Message[]) => {
    try {
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

      const stream = apiClientRef.current.chatStream(chatRequest);
      let accumulatedContent = '';

      for await (const chunk of stream) {
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
          // Stream completed successfully
          updateMessage(assistantMessageId, { 
            status: 'complete',
            timestamp: new Date()
          });
          setStreamingMessageId(null);
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

          // Accumulate content and update message
          accumulatedContent += chunkData;
          updateMessage(assistantMessageId, { 
            content: accumulatedContent,
            status: 'streaming'
          });
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      
      let errorMessage = 'Failed to get response';
      let userFriendlyMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide more specific error messages based on error type
        if (err.message.includes('HTTP 401') || err.message.includes('HTTP 403')) {
          userFriendlyMessage = 'Authentication failed. Please check your API key.';
        } else if (err.message.includes('HTTP 429')) {
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('HTTP 5')) {
          userFriendlyMessage = 'The AI service is temporarily unavailable. Please try again later.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          userFriendlyMessage = 'Network error. Please check your connection and try again.';
        }
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
    }
  }, [updateMessage, onError]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

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
      // Add user message
      const userMessage = {
        role: 'user' as const,
        content: content.trim(),
        status: 'complete' as const
      };
      
      const userMessageId = addMessage(userMessage);

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
        setTimeout(() => {
          handleStreamingResponse(assistantMessageId, updatedMessages);
        }, 100); // Small delay to ensure state is updated
        
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
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Return cleanup function as part of the hook
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