import type { ChatRequest, ChatResponse, StreamChunk } from './types';

/**
 * Enhanced API client for the AI Chatbot API with improved streaming support
 */
export class ChatbotApiClient {
  private apiUrl: string;
  private apiKey: string;

  private maxConnectionRetries: number = 3;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  // Getter properties for accessing private fields
  get baseUrl(): string {
    return this.apiUrl;
  }

  get key(): string {
    return this.apiKey;
  }

  /**
   * Send a chat request and get a complete response
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.apiUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await this.extractErrorMessage(response);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Enhanced streaming chat with better error handling and performance
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    let attempt = 0;
    const maxAttempts = this.maxConnectionRetries + 1;

    while (attempt < maxAttempts) {
      try {
        const response = await fetch(`${this.apiUrl}/api/v1/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            'Accept': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorText = await this.extractErrorMessage(response);
          
          // Check if this is a retryable error
          if (this.isRetryableError(response.status) && attempt < maxAttempts - 1) {
            attempt++;
            console.log(`Stream request failed (${response.status}), retrying... (${attempt}/${maxAttempts - 1})`);
            await this.delay(1000 * attempt); // Exponential backoff
            continue;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (!response.body) {
          throw new Error('No response body received from server');
        }

        // Reset connection retry count on successful connection
        // (Connection retry tracking removed for simplicity)

        yield* this.processStreamResponse(response);
        return; // Success, exit retry loop

      } catch (error) {
        // Check if this is a retryable error
        if (this.isRetryableStreamError(error) && attempt < maxAttempts - 1) {
          attempt++;
          console.log(`Stream error, retrying... (${attempt}/${maxAttempts - 1}):`, error);
          await this.delay(1000 * attempt); // Exponential backoff
          continue;
        }
        
        // Enhance error messages with more context
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request was cancelled');
          } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to the AI service');
          }
        }
        throw error;
      }
    }
  }

  /**
   * Process streaming response with enhanced chunk handling
   */
  private async *processStreamResponse(response: Response): AsyncGenerator<StreamChunk, void, unknown> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining buffer content
          if (buffer.trim()) {
            yield* this.processBufferContent(buffer);
          }
          
          console.log(`✅ Stream completed successfully (${chunkCount} chunks processed)`);
          yield { data: '', done: true };
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete SSE blocks (separated by \n\n)
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || ''; // Keep incomplete block in buffer

        for (const block of blocks) {
          if (!block.trim()) continue;

          const lines = block.split('\n');
          let eventType = 'data';
          let eventData = '';

          // Parse SSE format
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('event: ')) {
              eventType = trimmedLine.slice(7);
            } else if (trimmedLine.startsWith('data: ')) {
              eventData = trimmedLine.slice(6);
            }
          }

          // Handle different event types
          if (eventType === 'error') {
            throw new Error(`Server error: ${eventData || 'Unknown error'}`);
          } else if (eventType === 'data' || eventType === 'message') {
            // Skip empty data and completion markers
            if (eventData && eventData !== '[DONE]') {
              chunkCount++;
              yield { data: eventData, done: false };
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process remaining buffer content
   */
  private *processBufferContent(buffer: string): Generator<StreamChunk, void, unknown> {
    const lines = buffer.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && trimmedLine.startsWith('data: ')) {
        const content = trimmedLine.slice(6);
        if (content && content !== '[DONE]') {
          yield { data: content, done: false };
        }
      }
    }
  }

  /**
   * Extract error message from response
   */
  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        return errorData.detail || errorData.message || response.statusText;
      } else {
        const errorText = await response.text();
        
        // Handle SSE error format
        if (errorText.includes('event: error')) {
          const dataMatch = errorText.match(/data: (.+)/);
          if (dataMatch) {
            return dataMatch[1];
          }
        }
        
        return errorText || response.statusText;
      }
    } catch {
      return response.statusText || 'Unknown error';
    }
  }

  /**
   * Check if HTTP status code indicates a retryable error
   */
  private isRetryableError(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408; // 408 = Request Timeout
  }

  /**
   * Check if stream error is retryable
   */
  private isRetryableStreamError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const message = error.message.toLowerCase();
    return (
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      (message.includes('http 5') && !message.includes('http 501')) || // Server errors except Not Implemented
      message.includes('http 429') || // Rate limiting
      message.includes('http 408')    // Request timeout
    );
  }

  /**
   * Utility delay function for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check API health with enhanced error handling
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // No API key required for health check
      });
      
      if (!response.ok) {
        const errorText = await this.extractErrorMessage(response);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to the health endpoint');
        }
      }
      throw error;
    }
  }
} 