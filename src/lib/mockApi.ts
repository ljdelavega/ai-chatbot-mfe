import type { ChatRequest, ChatResponse, StreamChunk } from './types';

/**
 * Mock API client for testing streaming functionality
 * Simulates the real AI Chatbot API behavior
 */
export class MockChatbotApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate random errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('HTTP 500: Internal Server Error');
    }

    const response = this.generateMockResponse(request);
    return {
      content: response,
      model: 'mock-ai-model-v1'
    };
  }

  /**
   * Send a chat request and get a streaming response
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    // Simulate initial delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate authentication error (2% chance)
    if (Math.random() < 0.02) {
      throw new Error('HTTP 401: Invalid API key provided');
    }

    // Simulate network error (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('Failed to fetch: Network error');
    }

    const response = this.generateMockResponse(request);
    const words = response.split(' ');

    // Stream words with realistic delays
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isLastWord = i === words.length - 1;
      
      // Add space before word (except first word)
      const content = i === 0 ? word : ` ${word}`;
      
      yield {
        data: content,
        done: false
      };

      // Simulate typing delay (50-200ms per word)
      if (!isLastWord) {
        const delay = Math.random() * 150 + 50;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Signal completion
    yield {
      data: '',
      done: true
    };
  }

  /**
   * Check API health
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate a mock response based on user input
   */
  private generateMockResponse(request: ChatRequest): string {
    const lastMessage = request.messages[request.messages.length - 1];
    const userInput = lastMessage?.content.toLowerCase() || '';

    // Contextual responses based on input
    if (userInput.includes('hello') || userInput.includes('hi')) {
      return "Hello! I'm your AI assistant. I'm here to help you with any questions or tasks you might have. What would you like to know about?";
    }

    if (userInput.includes('help') || userInput.includes('what can you do')) {
      return "I can help you with a wide variety of tasks! I can answer questions, provide explanations, help with problem-solving, assist with writing, offer suggestions, and engage in conversations on many topics. I'm particularly good at breaking down complex topics and providing step-by-step guidance. What specific area would you like assistance with?";
    }

    if (userInput.includes('test') || userInput.includes('testing')) {
      return "Great! This is a test of the streaming functionality. As you can see, this response is being delivered word by word in real-time, simulating how the actual AI API would stream responses. The streaming creates a more engaging user experience by showing progress as the AI generates its response.";
    }

    if (userInput.includes('widget') || userInput.includes('chatbot')) {
      return "This chatbot widget is built with React and TypeScript, featuring real-time streaming responses, fullscreen mode, and minimize functionality. It's designed to be easily embedded into any website with just a script tag and configuration attributes. The widget supports multiple states: normal view for regular conversations, fullscreen mode for focused interactions, and minimized mode that collapses into a bottom bar.";
    }

    if (userInput.includes('features') || userInput.includes('functionality')) {
      return "Key features of this chatbot widget include:\n\n• Real-time streaming responses for engaging conversations\n• Fullscreen mode for focused interactions\n• Minimize to bottom bar for unobtrusive access\n• Responsive design for mobile and desktop\n• Smooth animations and professional UI\n• Easy embedding with simple configuration\n• TypeScript support for type safety\n• Comprehensive error handling and recovery\n\nWould you like me to demonstrate any of these features?";
    }

    if (userInput.includes('code') || userInput.includes('programming')) {
      return "I can definitely help with programming questions! Here's a simple example of how this widget might be embedded:\n\n```html\n<div id=\"ai-chatbot-root\" \n     data-api-url=\"https://your-api.com\"\n     data-api-key=\"your-api-key\">\n</div>\n<script src=\"chatbot-widget.js\"></script>\n```\n\nThe widget automatically finds the div, reads the configuration, and initializes itself. What programming topic would you like to explore?";
    }

    if (userInput.includes('error') || userInput.includes('problem')) {
      return "I understand you might be experiencing an issue. I'm here to help troubleshoot! Could you provide more details about what specific problem you're encountering? The more information you can share, the better I can assist you in finding a solution.";
    }

    if (userInput.includes('streaming') || userInput.includes('real-time')) {
      return "Streaming responses work by sending data in real-time as it's generated, rather than waiting for the complete response. This creates a better user experience because you can see the AI 'thinking' and responding progressively. The technical implementation uses Server-Sent Events (SSE) to maintain a persistent connection and stream text chunks as they're produced by the AI model.";
    }

    // Default responses for general queries
    const defaultResponses = [
      "That's an interesting question! Let me think about that for a moment. Could you provide a bit more context or detail about what you're looking for? I'd be happy to dive deeper into this topic.",
      
      "I'd be happy to help you with that! Can you tell me more about what specific aspect you're most interested in? The more details you provide, the better I can tailor my response to your needs.",
      
      "Great question! There are several ways to approach this topic. What's your main goal or what outcome are you hoping to achieve? Understanding your objective will help me provide the most relevant guidance.",
      
      "Thanks for asking! I can definitely assist with that. To give you the most helpful information, could you share a bit more about your specific situation or what you're trying to accomplish?",
      
      "I appreciate you reaching out with this question. To provide you with the most accurate and useful response, could you elaborate on what particular aspect interests you most? I'm here to help however I can!"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

// Export a function to create the appropriate client based on environment
export function createApiClient(apiUrl: string, apiKey: string) {
  // In development, use mock API if the URL contains 'localhost' and port 8000
  // This allows testing without running the real API
  if (apiUrl.includes('localhost:8000') && process.env.NODE_ENV === 'development') {
    console.log('🔧 Using Mock API for development testing');
    return new MockChatbotApiClient(apiUrl, apiKey);
  }
  
  // Import the real API client dynamically to avoid bundling it unnecessarily
  return import('./api').then(module => new module.ChatbotApiClient(apiUrl, apiKey));
} 