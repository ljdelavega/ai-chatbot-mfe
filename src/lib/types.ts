// Core types for the AI Chatbot Widget
// Re-exports and extensions of API types for internal use

import type { 
  Message as ApiMessage, 
  MessageRole,
  ChatRequest as ApiChatRequest,
  ChatResponse as ApiChatResponse,
  ApiConfig,
  StreamChunk as ApiStreamChunk,
  ApiError as BaseApiError
} from './api-types';

// Enhanced message status types for better status management
export type MessageStatus = 
  | 'pending'     // Message is being prepared to send
  | 'sending'     // Message is being sent to API
  | 'streaming'   // Assistant message is being streamed
  | 'complete'    // Message completed successfully
  | 'error'       // Message failed with error
  | 'retrying';   // Message is being retried

// Extended message interface for widget use (adds UI-specific fields)
export interface Message extends Omit<ApiMessage, 'role'> {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  error?: string;        // Error message for failed messages
  retryCount?: number;   // Number of retry attempts
  canRetry?: boolean;    // Whether this message can be retried
}

// Re-export API types for compatibility
export type { 
  MessageRole,
  ApiChatRequest as ChatRequest,
  ApiChatResponse as ChatResponse,
  ApiConfig
};

// Widget configuration types (extends API config)
export interface WidgetConfig extends ApiConfig {
  themeColor?: string;
  enableHistory?: boolean;
  debug?: boolean;
}

// Widget-specific error type (extends API error)
export interface ApiError extends BaseApiError {
  // Additional widget-specific error properties can be added here
}

// Widget-specific streaming types
export interface StreamChunk extends ApiStreamChunk {
  // Additional widget-specific streaming properties can be added here
}

// Message retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableErrors: string[];
} 