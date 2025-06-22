import React, { useState, useCallback, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import MinimizeBar from './MinimizeBar';
import type { WidgetState } from './WidgetContainer';
import type { Message } from '../lib/types';

export interface WidgetProps {
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
  minimizeBarPosition?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  onStateChange?: (state: WidgetState) => void;
  hasNewMessages?: boolean;
}

const Widget: React.FC<WidgetProps> = ({
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
  minimizeBarPosition = 'bottom-right',
  onStateChange,
  hasNewMessages = false,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>(initialState);
  const [previousState, setPreviousState] = useState<WidgetState>('normal');

  const handleMinimize = useCallback(() => {
    setPreviousState(widgetState);
    setWidgetState('minimized');
    onStateChange?.('minimized');
  }, [widgetState, onStateChange]);

  const handleRestore = useCallback(() => {
    const newState = previousState === 'minimized' ? 'normal' : previousState;
    setWidgetState(newState);
    onStateChange?.(newState);
  }, [previousState, onStateChange]);

  const handleToggleFullscreen = useCallback(() => {
    if (widgetState === 'fullscreen') {
      const newState = previousState === 'minimized' ? 'normal' : previousState;
      setWidgetState(newState);
      onStateChange?.(newState);
    } else {
      setPreviousState(widgetState);
      setWidgetState('fullscreen');
      onStateChange?.('fullscreen');
    }
  }, [widgetState, previousState, onStateChange]);

  // Sync internal state with external state changes
  useEffect(() => {
    if (initialState !== widgetState) {
      setWidgetState(initialState);
    }
  }, [initialState, widgetState]);

  return (
    <>
      {/* Main widget container - hidden when minimized */}
      {widgetState !== 'minimized' && (
        <WidgetContainer
          messages={messages}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
          title={title}
          subtitle={subtitle}
          showMinimize={showMinimize}
          showFullscreen={showFullscreen}
          showClose={showClose}
          onClose={onClose}
          className={className}
          initialState={widgetState}
          // Pass state management functions
          onMinimize={handleMinimize}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Minimize bar - shown when minimized */}
      {widgetState === 'minimized' && (
        <MinimizeBar
          title={title}
          subtitle={subtitle}
          onClick={handleRestore}
          position={minimizeBarPosition}
          hasNewMessages={hasNewMessages}
          isVisible={widgetState === 'minimized'}
          autoFocus={widgetState === 'minimized'}
        />
      )}
    </>
  );
};

export default Widget; 