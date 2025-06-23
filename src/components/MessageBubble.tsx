import React from 'react';
import type { Message } from '../lib/types';
import { Avatar, LoadingSpinner, Button, Icon } from './index';

export interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onRetry?: (messageId: string) => void;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  onRetry,
  className = '',
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-lg rounded-br-none'
    : 'bg-white border border-gray-200 text-gray-900 rounded-lg rounded-bl-none';

  const containerClasses = isUser
    ? 'flex justify-end'
    : 'flex justify-start';

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'error':
        return 'text-red-500';
      case 'retrying':
        return 'text-yellow-500';
      case 'streaming':
        return 'text-blue-500';
      case 'sending':
        return 'text-gray-500';
      default:
        return isUser ? 'text-blue-100' : 'text-gray-500';
    }
  };

  const renderTypingIndicator = () => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
      </div>
    );
  };

  const renderMessageStatus = () => {
    const status = message.status || 'complete';
    
    // Show typing indicator for streaming assistant messages
    if (isStreaming && isAssistant) {
      return renderTypingIndicator();
    }

    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 mt-1">
            <LoadingSpinner size="sm" variant={isUser ? 'white' : 'secondary'} />
            <span className={`text-xs ${getStatusColor(status)}`}>
              Preparing...
            </span>
          </div>
        );

      case 'sending':
        return (
          <div className="flex items-center gap-1 mt-1">
            <LoadingSpinner size="sm" variant={isUser ? 'white' : 'secondary'} />
            <span className={`text-xs ${getStatusColor(status)}`}>
              Sending...
            </span>
          </div>
        );

      case 'streaming':
        return (
          <div className="flex items-center gap-1 mt-1">
            <LoadingSpinner size="sm" variant="primary" />
            <span className={`text-xs ${getStatusColor(status)}`}>
              Responding...
            </span>
          </div>
        );

      case 'retrying':
        return (
          <div className="flex items-center gap-1 mt-1">
            <LoadingSpinner size="sm" variant="secondary" />
            <span className={`text-xs ${getStatusColor(status)}`}>
              Retrying... ({message.retryCount || 0}/3)
            </span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Icon name="close" size={16} className="text-red-500" />
              <span className="text-xs text-red-500">
                {message.error || 'Failed to send'}
              </span>
            </div>
            {message.canRetry && onRetry && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onRetry(message.id)}
                className="text-xs px-2 py-1 h-auto"
              >
                <Icon name="loading" size={16} className="mr-1" />
                Retry
              </Button>
            )}
          </div>
        );

      case 'complete':
      default:
        return (
          <span className={`text-xs ${getStatusColor(status)}`}>
            {formatTimestamp(message.timestamp)}
          </span>
        );
    }
  };

  const renderStreamingCursor = () => {
    if (isStreaming && isAssistant) {
      return (
        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse rounded-sm" />
      );
    }
    return null;
  };

  return (
    <div className={`flex gap-3 max-w-full ${className}`}>
      {/* Avatar for assistant messages */}
      {isAssistant && (
        <div className="flex-shrink-0">
          <Avatar type="bot" size="sm" />
        </div>
      )}
      
      {/* Message content container */}
      <div className={`flex-1 ${containerClasses}`}>
        <div className="max-w-xs sm:max-w-md">
          {/* Avatar for user messages (shown on right) */}
          {isUser && (
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className={`p-3 ${bubbleClasses} ${message.status === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <div className="flex justify-end mt-1">
                  {renderMessageStatus()}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Avatar type="user" size="sm" />
              </div>
            </div>
          )}
          
          {/* Assistant message layout */}
          {isAssistant && (
            <div>
              <div className={`p-3 ${bubbleClasses}`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                  {renderStreamingCursor()}
                </p>
              </div>
              <div className="mt-1">
                {renderMessageStatus()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 