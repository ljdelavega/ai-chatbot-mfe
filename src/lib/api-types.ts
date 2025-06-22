/**
 * TypeScript types for AI Chatbot API
 * Generated from OpenAPI specification v0.1.0
 * 
 * This file contains type definitions that match the API schema
 * defined in the OpenAPI spec at ai-chatbot-api/openapi.yaml
 */

// ============================================================================
// Message Types
// ============================================================================

/**
 * Role of the message sender in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a chat conversation
 */
export interface Message {
  /** The role of the message sender */
  role: MessageRole;
  /** The content of the message (1-10000 characters) */
  content: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request payload for chat endpoints
 */
export interface ChatRequest {
  /** List of messages in the conversation history (1-50 messages) */
  messages: Message[];
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response from the non-streaming chat endpoint
 */
export interface ChatResponse {
  /** The AI's response content */
  content: string;
  /** The AI model that generated the response */
  model: string;
}

/**
 * Response from the health check endpoint
 */
export interface HealthResponse {
  /** Health status of the service */
  status: string;
  /** Current server timestamp in ISO 8601 format */
  timestamp: string;
  /** API version */
  version: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  /** Error message describing what went wrong */
  detail: string;
}

// ============================================================================
// API Configuration Types
// ============================================================================

/**
 * Configuration for the API client
 */
export interface ApiConfig {
  /** Base URL of the API (e.g., 'http://localhost:8000') */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  /** AbortController signal for cancelling requests */
  signal?: AbortSignal;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
}

// ============================================================================
// Streaming Types
// ============================================================================

/**
 * Streaming response chunk from the chat/stream endpoint
 */
export interface StreamChunk {
  /** The text content of this chunk */
  data: string;
  /** Whether this is the final chunk */
  done?: boolean;
}

/**
 * Streaming error event
 */
export interface StreamError {
  /** Error event type */
  event: 'error';
  /** Error message */
  data: string;
}

/**
 * Callback function for handling streaming chunks
 */
export type StreamCallback = (chunk: StreamChunk) => void;

/**
 * Callback function for handling streaming errors
 */
export type StreamErrorCallback = (error: StreamError) => void;

/**
 * Options for streaming requests
 */
export interface StreamOptions extends ApiRequestOptions {
  /** Callback for each chunk received */
  onChunk?: StreamCallback;
  /** Callback for streaming errors */
  onError?: StreamErrorCallback;
  /** Callback when streaming completes */
  onComplete?: () => void;
}

// ============================================================================
// HTTP Status Code Types
// ============================================================================

/**
 * HTTP status codes that the API can return
 */
export enum ApiStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
}

/**
 * API error with status code and message
 */
export class ApiError extends Error {
  constructor(
    public statusCode: ApiStatusCode,
    public detail: string,
    public response?: Response
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  /**
   * Check if the error is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if the error is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if the error is due to authentication issues
   */
  get isAuthError(): boolean {
    return this.statusCode === ApiStatusCode.UNAUTHORIZED || 
           this.statusCode === ApiStatusCode.FORBIDDEN;
  }

  /**
   * Check if the error is due to rate limiting
   */
  get isRateLimit(): boolean {
    return this.statusCode === ApiStatusCode.TOO_MANY_REQUESTS;
  }
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation constraints from the API
 */
export const API_CONSTRAINTS = {
  MESSAGE: {
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 10000,
  },
  CHAT_REQUEST: {
    MESSAGES_MIN_COUNT: 1,
    MESSAGES_MAX_COUNT: 50,
  },
} as const;

/**
 * Validation result for API requests
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type from an API response
 */
export type ApiResponseData<T> = T extends { data: infer D } ? D : T;

/**
 * Make all properties of an API type optional for partial updates
 */
export type PartialApiType<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Endpoints available in the API
 */
export enum ApiEndpoint {
  HEALTH = '/api/v1/health',
  CHAT = '/api/v1/chat',
  CHAT_STREAM = '/api/v1/chat/stream',
}

/**
 * HTTP methods used by the API
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid MessageRole
 */
export function isMessageRole(value: unknown): value is MessageRole {
  return typeof value === 'string' && 
         ['system', 'user', 'assistant'].includes(value);
}

/**
 * Type guard to check if a value is a valid Message
 */
export function isMessage(value: unknown): value is Message {
  return typeof value === 'object' && 
         value !== null &&
         'role' in value &&
         'content' in value &&
         isMessageRole((value as any).role) &&
         typeof (value as any).content === 'string' &&
         (value as any).content.length >= API_CONSTRAINTS.MESSAGE.CONTENT_MIN_LENGTH &&
         (value as any).content.length <= API_CONSTRAINTS.MESSAGE.CONTENT_MAX_LENGTH;
}

/**
 * Type guard to check if a value is a valid ChatRequest
 */
export function isChatRequest(value: unknown): value is ChatRequest {
  return typeof value === 'object' && 
         value !== null &&
         'messages' in value &&
         Array.isArray((value as any).messages) &&
         (value as any).messages.length >= API_CONSTRAINTS.CHAT_REQUEST.MESSAGES_MIN_COUNT &&
         (value as any).messages.length <= API_CONSTRAINTS.CHAT_REQUEST.MESSAGES_MAX_COUNT &&
         (value as any).messages.every(isMessage);
}

/**
 * Type guard to check if a response is an ErrorResponse
 */
export function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === 'object' && 
         value !== null &&
         'detail' in value &&
         typeof (value as any).detail === 'string';
} 