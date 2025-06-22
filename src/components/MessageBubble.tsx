import React from 'react';
import type { Message } from '../lib/types';
import { Avatar, LoadingSpinner } from './index';

export interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
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

  const renderMessageStatus = () => {
    if (isStreaming) {
      return (
        <div className="flex items-center gap-1 mt-1">
          <LoadingSpinner size="sm" variant={isUser ? 'white' : 'secondary'} />
          <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            Typing...
          </span>
        </div>
      );
    }

    if (message.status === 'loading') {
      return (
        <div className="flex items-center gap-1 mt-1">
          <LoadingSpinner size="sm" variant={isUser ? 'white' : 'secondary'} />
          <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            Sending...
          </span>
        </div>
      );
    }

    if (message.status === 'error') {
      return (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-red-500">Failed to send</span>
        </div>
      );
    }

    return (
      <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
        {formatTimestamp(message.timestamp)}
      </span>
    );
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
                <div className={`p-3 ${bubbleClasses}`}>
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
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                  )}
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