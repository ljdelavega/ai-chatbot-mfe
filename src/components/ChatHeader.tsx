import React from 'react';
import { Button, Icon } from './index';

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  showMinimize?: boolean;
  showFullscreen?: boolean;
  showClose?: boolean;
  isFullscreen?: boolean;
  onMinimize?: () => void;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = 'AI Chatbot',
  subtitle,
  showMinimize = true,
  showFullscreen = true,
  showClose = true,
  isFullscreen = false,
  onMinimize,
  onToggleFullscreen,
  onClose,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-white ${className}`}>
      {/* Title section */}
      <div className="flex items-center gap-3">
        {/* Bot avatar/icon */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Icon name="bot" size={16} className="text-white" />
        </div>
        
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Controls section */}
      <div className="flex items-center gap-1">
        {showMinimize && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onMinimize}
            className="p-2 hover:bg-gray-100"
            aria-label="Minimize chat"
          >
            <Icon name="minimize" size={14} />
          </Button>
        )}
        
        {showFullscreen && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleFullscreen}
            className="p-2 hover:bg-gray-100"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Icon name={isFullscreen ? 'chevron-down' : 'expand'} size={14} />
          </Button>
        )}
        
        {showClose && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100"
            aria-label="Close chat"
          >
            <Icon name="close" size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader; 