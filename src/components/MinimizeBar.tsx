import React, { useEffect, useRef, useCallback } from 'react';
import { Icon } from './index';

export interface MinimizeBarProps {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  hasNewMessages?: boolean;
  isVisible?: boolean;
  autoFocus?: boolean;
}

const MinimizeBar: React.FC<MinimizeBarProps> = ({
  title = 'AI Chatbot',
  subtitle,
  onClick,
  className = '',
  position = 'bottom-right',
  hasNewMessages = false,
  isVisible = true,
  autoFocus = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  // Auto-focus management
  useEffect(() => {
    if (autoFocus && isVisible && buttonRef.current) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, isVisible]);

  // Enhanced click handler with validation
  const handleClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick && isVisible) {
      onClick();
    }
  }, [onClick, isVisible]);

  // Enhanced keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        handleClick(e);
        break;
      case 'Escape':
        // Allow escape to bubble up for potential widget management
        break;
      default:
        break;
    }
  }, [handleClick, isVisible]);

  const getPositionClasses = () => {
    const basePosition = (() => {
      switch (position) {
        case 'bottom-left':
          return 'bottom-4 left-4';
        case 'bottom-center':
          return 'bottom-4 left-1/2 transform -translate-x-1/2';
        case 'bottom-right':
        default:
          return 'bottom-4 right-4';
      }
    })();

    // Add visibility classes
    const visibilityClasses = isVisible 
      ? 'opacity-100 translate-y-0 pointer-events-auto' 
      : 'opacity-0 translate-y-2 pointer-events-none';

    return `${basePosition} ${visibilityClasses}`;
  };

  const getNotificationClasses = () => {
    return hasNewMessages 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-0';
  };

  // Don't render if not visible and fully transitioned out
  if (!isVisible && !hasNewMessages) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`
        fixed z-40 ${getPositionClasses()}
        bg-white border border-gray-200 rounded-full shadow-lg
        cursor-pointer hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        select-none
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={isVisible ? 0 : -1}
      aria-label={`${hasNewMessages ? 'New messages - ' : ''}Restore ${title}${subtitle ? ` - ${subtitle}` : ''}`}
      aria-pressed={false}
      aria-expanded={false}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Bot avatar/icon */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="bot" size={16} className="text-white" />
        </div>
        
        {/* Text content */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
        
        {/* Expand indicator */}
        <div className="flex-shrink-0 ml-2">
          <Icon name="chevron-up" size={14} className="text-gray-400" />
        </div>
      </div>
      
      {/* Notification dot */}
      <div 
        className={`
          absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white
          transition-all duration-200 ${getNotificationClasses()}
        `}
        aria-hidden="true"
      >
        {/* Pulsing animation for new messages */}
        {hasNewMessages && (
          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
    </div>
  );
};

export default MinimizeBar; 