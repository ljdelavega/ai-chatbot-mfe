import React from 'react';
import { Button, Icon } from './index';

export type EmptyStateType = 
  | 'welcome' 
  | 'no-messages' 
  | 'disconnected' 
  | 'loading' 
  | 'generic';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showIcon?: boolean;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  showIcon = true,
  className = '',
}) => {
  const getEmptyStateDetails = () => {
    switch (type) {
      case 'welcome':
        return {
          title: title || 'Welcome to AI Assistant',
          description: description || 'Start a conversation by typing a message below. I\'m here to help answer your questions and assist with various tasks.',
          icon: 'bot',
          actionLabel: actionLabel || 'Start Chatting',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'no-messages':
        return {
          title: title || 'No messages yet',
          description: description || 'Your conversation will appear here once you send your first message.',
          icon: 'user',
          actionLabel: actionLabel || 'Send a message',
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50',
        };
      case 'disconnected':
        return {
          title: title || 'Connection Lost',
          description: description || 'Unable to connect to the AI service. Please check your connection and try again.',
          icon: 'close',
          actionLabel: actionLabel || 'Reconnect',
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
        };
      case 'loading':
        return {
          title: title || 'Loading...',
          description: description || 'Setting up your AI assistant. This will just take a moment.',
          icon: 'loading',
          actionLabel: actionLabel,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
        };
      default:
        return {
          title: title || 'Nothing here yet',
          description: description || 'Get started by taking an action.',
          icon: 'user',
          actionLabel: actionLabel || 'Get Started',
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const details = getEmptyStateDetails();

  return (
    <div className={`
      flex flex-col items-center justify-center p-8 text-center
      ${className}
    `}>
      {showIcon && (
        <div className={`
          w-16 h-16 rounded-full ${details.bgColor} 
          flex items-center justify-center mb-4
          ${type === 'loading' ? 'animate-pulse' : ''}
        `}>
          <Icon 
            name={details.icon as any} 
            size={24} 
            className={`${details.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`}
          />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {details.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-sm leading-relaxed">
        {details.description}
      </p>
      
      {details.actionLabel && onAction && type !== 'loading' && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          className="min-w-[120px]"
        >
          {details.actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState; 