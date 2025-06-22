import { useState, useCallback, useRef } from 'react';
import type { Message, ChatRequest, WidgetConfig, StreamChunk } from '../lib/types';
import { ChatbotApiClient } from '../lib/api';

export interface UseChatOptions {
  config: WidgetConfig;
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retry: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export function useChat({ config, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep refs for cleanup and retry functionality
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const apiClientRef = useRef(new ChatbotApiClient(config.baseUrl, config.apiKey));

  // Update API client when config changes
  if (apiClientRef.current.apiUrl !== config.baseUrl || 
      apiClientRef.current.apiKey !== config.apiKey) {
    apiClientRef.current = new ChatbotApiClient(config.baseUrl, config.apiKey);
  }

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
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

  const handleStreamingResponse = useCallback(async (assistantMessageId: string, currentMessages: Message[]) => {
    try {
      const chatRequest: ChatRequest = {
        messages: currentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      const stream = apiClientRef.current.chatStream(chatRequest);
      let accumulatedContent = '';

      for await (const chunk of stream) {
        // Check if we were aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (chunk.done) {
          // Stream completed successfully
          updateMessage(assistantMessageId, { 
            status: 'complete',
            timestamp: new Date()
          });
          break;
        } else {
          // Accumulate content and update message
          accumulatedContent += chunk.data;
          updateMessage(assistantMessageId, { 
            content: accumulatedContent,
            status: 'streaming'
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      
      // Update assistant message to show error
      updateMessage(assistantMessageId, { 
        status: 'error',
        content: 'Sorry, I encountered an error. Please try again.'
      });
      
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
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
      addMessage({
        role: 'user',
        content: content.trim(),
        status: 'complete'
      });

      // Add assistant message with loading state
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
        status: 'loading'
      });

      // Handle streaming response after messages are updated
      setMessages(prev => {
        const updatedMessages = [...prev];
        
        // Handle streaming response with updated messages
        setTimeout(() => {
          handleStreamingResponse(assistantMessageId, updatedMessages);
        }, 0);
        
        return updatedMessages;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
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
    sendMessage,
    retry,
    clearMessages,
    clearError,
    // Internal cleanup method for advanced usage
    _cleanup: cleanup
  } as UseChatReturn & { _cleanup: () => void };
} 