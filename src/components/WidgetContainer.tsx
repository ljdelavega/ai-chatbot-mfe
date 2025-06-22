import React, { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { storage } from '../lib/storage';
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
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Preserve scroll position during state transitions
  const preserveScrollPosition = useCallback(() => {
    if (messageListRef.current) {
      setScrollPosition(messageListRef.current.scrollTop);
    }
  }, []);

  // Restore scroll position after state transitions
  const restoreScrollPosition = useCallback(() => {
    if (messageListRef.current && scrollPosition > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop = scrollPosition;
        }
      });
    }
  }, [scrollPosition]);

  // Enhanced state change handler with transition management
  const handleStateChange = useCallback((newState: WidgetState, shouldPreserveScroll = true) => {
    if (newState === widgetState || isTransitioning) return;

    setIsTransitioning(true);
    
    // Preserve scroll position if requested
    if (shouldPreserveScroll) {
      preserveScrollPosition();
    }

    // Store current state as previous for restoration
    if (newState !== 'minimized') {
      setPreviousState(widgetState);
    }

    // Handle focus management
    if (newState === 'fullscreen') {
      // Store the currently focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focus the container for keyboard navigation
      setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
    } else if (widgetState === 'fullscreen' && lastFocusedElement.current) {
      // Restore focus when exiting fullscreen
      setTimeout(() => {
        lastFocusedElement.current?.focus();
        lastFocusedElement.current = null;
      }, 100);
    }

    setWidgetState(newState);

    // Clear transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      if (shouldPreserveScroll) {
        restoreScrollPosition();
      }
    }, 300); // Match CSS transition duration
  }, [widgetState, isTransitioning, preserveScrollPosition, restoreScrollPosition]);

  // Enhanced keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to exit fullscreen
      if (e.key === 'Escape' && widgetState === 'fullscreen') {
        e.preventDefault();
        handleStateChange(previousState === 'minimized' ? 'normal' : previousState);
      }
      
      // Additional keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            // Ctrl/Cmd + Enter to toggle fullscreen
            if (showFullscreen && widgetState !== 'minimized') {
              e.preventDefault();
              handleStateChange(widgetState === 'fullscreen' ? 'normal' : 'fullscreen');
            }
            break;
          case 'm':
            // Ctrl/Cmd + M to minimize
            if (showMinimize && widgetState !== 'minimized') {
              e.preventDefault();
              handleStateChange('minimized', false);
            }
            break;
        }
      }
    };

    // Only add keyboard listeners when widget is visible
    if (widgetState !== 'minimized') {
      document.addEventListener('keydown', handleKeyDown as any);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [widgetState, previousState, showFullscreen, showMinimize, handleStateChange]);

  // Handle body scroll prevention in fullscreen
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    
    if (widgetState === 'fullscreen') {
      // Prevent body scroll in fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      // Restore original overflow or default
      document.body.style.overflow = originalOverflow || '';
    }

    return () => {
      // Cleanup: restore original overflow
      document.body.style.overflow = originalOverflow || '';
    };
  }, [widgetState]);

  // Handle browser resize in fullscreen mode
  useEffect(() => {
    const handleResize = () => {
      if (widgetState === 'fullscreen' && containerRef.current) {
        // Trigger a reflow to handle any layout issues
        containerRef.current.style.maxWidth = `calc(100vw - 2rem)`;
        containerRef.current.style.maxHeight = `calc(100vh - 2rem)`;
      }
    };

    if (widgetState === 'fullscreen') {
      window.addEventListener('resize', handleResize);
      // Initial resize handling
      handleResize();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [widgetState]);

  // Load saved state from storage on mount
  useEffect(() => {
    if (storage.isStorageAvailable()) {
      const savedState = storage.getWidgetState();
      const preferences = storage.getWidgetPreferences();
      
      // Only restore state if preferences allow it and we have a saved state
      if (preferences?.rememberState && savedState && savedState !== widgetState) {
        handleStateChange(savedState, false);
      } else if (!preferences) {
        // Initialize preferences if they don't exist
        storage.setWidgetPreferences({
          lastState: initialState,
          rememberState: true, // Default to remembering state
        });
      }
    }
  }, []); // Run only on mount

  // Save state changes to storage
  useEffect(() => {
    if (storage.isStorageAvailable()) {
      const preferences = storage.getWidgetPreferences();
      
      if (preferences?.rememberState) {
        storage.setWidgetState(widgetState);
        storage.setWidgetPreferences({
          ...preferences,
          lastState: widgetState,
        });
      }
    }
  }, [widgetState]);

  // Sync with external state changes
  useEffect(() => {
    if (initialState !== widgetState && !isTransitioning) {
      handleStateChange(initialState);
    }
  }, [initialState, widgetState, isTransitioning, handleStateChange]);

  // Enhanced action handlers
  const handleMinimize = useCallback(() => {
    if (externalOnMinimize) {
      externalOnMinimize();
    } else {
      handleStateChange('minimized', false);
    }
  }, [externalOnMinimize, handleStateChange]);

  const handleToggleFullscreen = useCallback(() => {
    if (externalOnToggleFullscreen) {
      externalOnToggleFullscreen();
    } else {
      const newState = widgetState === 'fullscreen' ? 'normal' : 'fullscreen';
      handleStateChange(newState);
    }
  }, [externalOnToggleFullscreen, widgetState, handleStateChange]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Only close on backdrop click, not on widget click
    if (e.target === e.currentTarget) {
      handleStateChange(previousState === 'minimized' ? 'normal' : previousState);
    }
  }, [previousState, handleStateChange]);



  // Don't render the main container when minimized
  if (widgetState === 'minimized') {
    return null;
  }

  const getContainerClasses = () => {
    const baseClasses = 'bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col transition-all duration-300 ease-in-out';
    const transitionClasses = isTransitioning ? 'pointer-events-none' : '';
    
    switch (widgetState) {
      case 'fullscreen':
        return `${baseClasses} ${transitionClasses} fixed inset-4 z-50 max-w-none max-h-none w-auto h-auto rounded-lg focus:outline-none`;
      case 'normal':
      default:
        return `${baseClasses} ${transitionClasses} fixed bottom-4 right-4 w-80 h-96 max-w-sm z-50`;
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
          onClick={handleBackdropClick}
          aria-label="Close fullscreen mode"
        />
      )}
      
      {/* Main widget container */}
      <div
        ref={containerRef}
        className={`${getContainerClasses()} ${className}`}
        style={getContainerStyles()}
        tabIndex={widgetState === 'fullscreen' ? 0 : -1}
        role="dialog"
        aria-modal={widgetState === 'fullscreen'}
        aria-label={`${title} - ${widgetState === 'fullscreen' ? 'Fullscreen mode' : 'Chat widget'}`}
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
        
        <div ref={messageListRef} className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            streamingMessageId={streamingMessageId}
            className="h-full"
          />
        </div>
        
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isLoading || isTransitioning}
          placeholder="Type your message..."
        />
      </div>
    </>
  );
};

export default WidgetContainer; 