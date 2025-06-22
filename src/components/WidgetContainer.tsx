import React, { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from '../lib/types';

export type WidgetState = 'normal' | 'fullscreen' | 'minimized';

export interface WidgetContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  streamingMessageId?: string;
  title?: string;
  subtitle?: string;
  showMinimize?: boolean;
  showFullscreen?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
  initialState?: WidgetState;
  onMinimize?: () => void;
  onToggleFullscreen?: () => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  streamingMessageId,
  title = 'AI Chatbot',
  subtitle,
  showMinimize = true,
  showFullscreen = true,
  showClose = true,
  onClose,
  className = '',
  initialState = 'normal',
  onMinimize: externalOnMinimize,
  onToggleFullscreen: externalOnToggleFullscreen,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>(initialState);
  const [previousState, setPreviousState] = useState<WidgetState>('normal');
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && widgetState === 'fullscreen') {
        handleExitFullscreen();
      }
    };

    if (widgetState === 'fullscreen') {
      document.addEventListener('keydown', handleKeyDown as any);
      // Prevent body scroll in fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
      document.body.style.overflow = '';
    };
  }, [widgetState]);

  const handleMinimize = () => {
    if (externalOnMinimize) {
      externalOnMinimize();
    } else {
      setPreviousState(widgetState);
      setWidgetState('minimized');
    }
  };

  const handleToggleFullscreen = () => {
    if (externalOnToggleFullscreen) {
      externalOnToggleFullscreen();
    } else {
      if (widgetState === 'fullscreen') {
        setWidgetState(previousState === 'minimized' ? 'normal' : previousState);
      } else {
        setPreviousState(widgetState);
        setWidgetState('fullscreen');
      }
    }
  };

  const handleExitFullscreen = () => {
    setWidgetState(previousState === 'minimized' ? 'normal' : previousState);
  };



  // Don't render the main container when minimized
  if (widgetState === 'minimized') {
    return null;
  }

  const getContainerClasses = () => {
    const baseClasses = 'bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col transition-all duration-300 ease-in-out';
    
    switch (widgetState) {
      case 'fullscreen':
        return `${baseClasses} fixed inset-4 z-50 max-w-none max-h-none w-auto h-auto rounded-lg`;
      case 'normal':
      default:
        return `${baseClasses} w-80 h-96 max-w-sm`;
    }
  };

  const getContainerStyles = () => {
    switch (widgetState) {
      case 'fullscreen':
        return {
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 2rem)',
        };
      case 'normal':
      default:
        return {};
    }
  };

  return (
    <>
      {/* Backdrop for fullscreen mode */}
      {widgetState === 'fullscreen' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleExitFullscreen}
        />
      )}
      
      {/* Main widget container */}
      <div
        ref={containerRef}
        className={`${getContainerClasses()} ${className}`}
        style={getContainerStyles()}
      >
        <ChatHeader
          title={title}
          subtitle={subtitle}
          showMinimize={showMinimize}
          showFullscreen={showFullscreen}
          showClose={showClose}
          isFullscreen={widgetState === 'fullscreen'}
          onMinimize={handleMinimize}
          onToggleFullscreen={handleToggleFullscreen}
          onClose={onClose}
        />
        
        <MessageList
          messages={messages}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
          className="flex-1"
        />
        
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </>
  );
};

export default WidgetContainer; 