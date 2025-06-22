import React, { useState, useCallback } from 'react';
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
  // Enhanced error and loading states
  errorState?: {
    type: 'network' | 'api' | 'timeout' | 'rate-limit' | 'auth' | 'generic';
    title?: string;
    message?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
  };
  networkStatus?: 'online' | 'offline' | 'reconnecting' | 'error';
  onNetworkRetry?: () => void;
  onEmptyStateAction?: () => void;
  emptyStateType?: 'welcome' | 'no-messages' | 'disconnected' | 'loading' | 'generic';
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
  errorState,
  networkStatus,
  onNetworkRetry,
  onEmptyStateAction,
  emptyStateType = 'welcome',
}) => {
  // Use the initialState directly as the current state when onStateChange is provided (controlled)
  // Otherwise maintain internal state (uncontrolled)
  const isControlled = onStateChange !== undefined;
  const [internalWidgetState, setInternalWidgetState] = useState<WidgetState>(initialState);
  const [previousState, setPreviousState] = useState<WidgetState>('normal');
  
  const widgetState = isControlled ? initialState : internalWidgetState;

  const handleMinimize = useCallback(() => {
    setPreviousState(widgetState);
    if (isControlled) {
      onStateChange('minimized');
    } else {
      setInternalWidgetState('minimized');
    }
  }, [widgetState, onStateChange, isControlled]);

  const handleRestore = useCallback(() => {
    // When restoring from minimized, go back to the previous state
    // But ensure we don't get stuck in an invalid state
    const newState = previousState === 'minimized' ? 'normal' : previousState;
    if (isControlled) {
      onStateChange(newState);
    } else {
      setInternalWidgetState(newState);
    }
    // Reset previous state to normal after restoring to prevent state confusion
    setPreviousState('normal');
  }, [previousState, onStateChange, isControlled]);

  const handleToggleFullscreen = useCallback(() => {
    if (widgetState === 'fullscreen') {
      // When exiting fullscreen, always go to normal mode
      // Don't use previousState here as it might be 'minimized' which would cause issues
      if (isControlled) {
        onStateChange('normal');
      } else {
        setInternalWidgetState('normal');
      }
    } else {
      // When entering fullscreen, save current state as previous
      setPreviousState(widgetState);
      if (isControlled) {
        onStateChange('fullscreen');
      } else {
        setInternalWidgetState('fullscreen');
      }
    }
  }, [widgetState, onStateChange, isControlled]);

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
          // Pass enhanced error and loading states
          errorState={errorState}
          networkStatus={networkStatus}
          onNetworkRetry={onNetworkRetry}
          onEmptyStateAction={onEmptyStateAction}
          emptyStateType={emptyStateType}
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