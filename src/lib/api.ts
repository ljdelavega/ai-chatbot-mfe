import type { ChatRequest, ChatResponse, StreamChunk } from './types';

/**
 * API client for the AI Chatbot API
 */
export class ChatbotApiClient {
  private apiUrl: string;
  private apiKey: string;

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send a chat request and get a streaming response
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch(`${this.apiUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from server');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining buffer content
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine && trimmedLine.startsWith('data: ')) {
                const content = trimmedLine.slice(6); // Remove 'data: ' prefix
                if (content && content !== '[DONE]') {
                  yield { data: content, done: false };
                }
              }
            }
          }
          yield { data: '', done: true };
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines (SSE format: "data: content\n\n")
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const block of lines) {
          const blockLines = block.split('\n');
          for (const line of blockLines) {
            const trimmedLine = line.trim();
            
            // Handle SSE data lines
            if (trimmedLine.startsWith('data: ')) {
              const content = trimmedLine.slice(6); // Remove 'data: ' prefix
              
              // Skip empty data and completion markers
              if (!content || content === '[DONE]') {
                continue;
              }
              
              yield { data: content, done: false };
            }
            // Handle SSE error events
            else if (trimmedLine.startsWith('event: error')) {
              // Look for the next data line with error message
              const nextDataLine = blockLines.find(l => l.trim().startsWith('data: '));
              if (nextDataLine) {
                const errorMessage = nextDataLine.trim().slice(6);
                throw new Error(`Server error: ${errorMessage}`);
              } else {
                throw new Error('Server reported an error');
              }
            }
          }
        }
      }
    } catch (error) {
      // Enhance error messages with more context
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to the AI service');
        }
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Check API health
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.apiUrl}/api/v1/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
} 