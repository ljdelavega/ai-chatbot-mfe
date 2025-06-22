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
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield { content: '', done: true };
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (chunk.trim()) {
          yield { content: chunk, done: false };
        }
      }
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