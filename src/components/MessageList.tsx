import React, { useEffect, useRef } from 'react';
import type { Message } from '../lib/types';
import MessageBubble from './MessageBubble';

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  streamingMessageId?: string;
  className?: string;
  autoScroll?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  streamingMessageId,
  className = '',
  autoScroll = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or content changes
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessageId, autoScroll]);

  // Force scroll to bottom when streaming starts
  useEffect(() => {
    if (streamingMessageId && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingMessageId]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Start a conversation
      </h3>
      <p className="text-gray-600 max-w-sm">
        Send a message to begin chatting with the AI assistant.
      </p>
    </div>
  );

  const renderLoadingIndicator = () => (
    <div className="flex items-center gap-2 p-4 text-gray-600">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">AI is thinking...</span>
    </div>
  );

  return (
    <div 
      ref={scrollContainerRef}
      className={`flex-1 overflow-y-auto smooth-scroll custom-scrollbar ${className}`}
    >
      {messages.length === 0 && !isLoading ? (
        renderEmptyState()
      ) : (
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={streamingMessageId === message.id}
            />
          ))}
          
          {isLoading && renderLoadingIndicator()}
          
          {/* Invisible element to scroll to */}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList; 