import React from 'react';
import { Icon } from './index';

export interface MinimizeBarProps {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const MinimizeBar: React.FC<MinimizeBarProps> = ({
  title = 'AI Chatbot',
  subtitle,
  onClick,
  className = '',
  position = 'bottom-right',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div
      className={`
        fixed z-40 ${getPositionClasses()}
        bg-white border border-gray-200 rounded-full shadow-lg
        cursor-pointer hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        ${className}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Restore ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
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
      
      {/* Notification dot (optional) */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white opacity-0 transition-opacity duration-200">
        {/* This could be shown when there are new messages */}
      </div>
    </div>
  );
};

export default MinimizeBar; 