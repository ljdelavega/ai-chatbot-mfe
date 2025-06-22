import React, { useEffect, useRef } from 'react';
import type { Message } from '../lib/types';
import MessageBubble from './MessageBubble';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import NetworkStatus from './NetworkStatus';
import type { EmptyStateType, ErrorType, NetworkStatusType } from './index';

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  streamingMessageId?: string;
  className?: string;
  autoScroll?: boolean;
  emptyStateType?: EmptyStateType;
  errorState?: {
    type: ErrorType;
    title?: string;
    message?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
  };
  networkStatus?: NetworkStatusType;
  onNetworkRetry?: () => void;
  onEmptyStateAction?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  streamingMessageId,
  className = '',
  autoScroll = true,
  emptyStateType = 'welcome',
  errorState,
  networkStatus,
  onNetworkRetry,
  onEmptyStateAction,
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
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        type={emptyStateType}
        onAction={onEmptyStateAction}
      />
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
      {/* Network Status Indicator */}
      {networkStatus && networkStatus !== 'online' && (
        <div className="p-2 border-b border-gray-100">
          <NetworkStatus
            status={networkStatus}
            onRetry={onNetworkRetry}
            className="w-full justify-center"
          />
        </div>
      )}

      {/* Error State */}
      {errorState && (
        <div className="p-4">
          <ErrorMessage
            type={errorState.type}
            title={errorState.title}
            message={errorState.message}
            onRetry={errorState.onRetry}
            onDismiss={errorState.onDismiss}
          />
        </div>
      )}

      {/* Messages or Empty State */}
      {messages.length === 0 && !isLoading && !errorState ? (
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