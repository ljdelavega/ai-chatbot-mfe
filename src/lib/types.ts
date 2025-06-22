// Core message types that match the AI Chatbot API
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'loading' | 'error' | 'complete';
}

// API request/response types
export interface ChatRequest {
  messages: Omit<Message, 'id' | 'timestamp' | 'status'>[];
}

export interface ChatResponse {
  content: string;
  model: string;
}

// Widget configuration types
export interface WidgetConfig {
  apiUrl: string;
  apiKey: string;
  themeColor?: string;
  enableHistory?: boolean;
  debug?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Streaming types
export interface StreamChunk {
  content: string;
  done: boolean;
} 