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

// Extended message interface for widget use (adds UI-specific fields)
export interface Message extends Omit<ApiMessage, 'role'> {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: 'loading' | 'error' | 'complete' | 'streaming';
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