import React from 'react';
import { Button, Icon } from './index';

export type ErrorType = 
  | 'network' 
  | 'api' 
  | 'timeout' 
  | 'rate-limit' 
  | 'auth' 
  | 'generic';

export interface ErrorMessageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  retryLabel?: string;
  dismissLabel?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  onDismiss,
  className = '',
  showIcon = true,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
}) => {
  const getErrorDetails = () => {
    switch (type) {
      case 'network':
        return {
          title: title || 'Connection Error',
          message: message || 'Unable to connect to the server. Please check your internet connection and try again.',
          icon: 'close',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'api':
        return {
          title: title || 'Service Error',
          message: message || 'The AI service is currently unavailable. Please try again in a moment.',
          icon: 'close',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case 'timeout':
        return {
          title: title || 'Request Timeout',
          message: message || 'The request took too long to complete. Please try again.',
          icon: 'loading',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'rate-limit':
        return {
          title: title || 'Rate Limit Exceeded',
          message: message || 'Too many requests. Please wait a moment before trying again.',
          icon: 'close',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
      case 'auth':
        return {
          title: title || 'Authentication Error',
          message: message || 'Invalid API key or authentication failed. Please check your configuration.',
          icon: 'close',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          title: title || 'Something went wrong',
          message: message || 'An unexpected error occurred. Please try again.',
          icon: 'close',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className={`
      rounded-lg border p-4 ${errorDetails.bgColor} ${errorDetails.borderColor}
      ${className}
    `}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`flex-shrink-0 ${errorDetails.color}`}>
            <Icon name={errorDetails.icon as any} size={20} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${errorDetails.color} mb-1`}>
            {errorDetails.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {errorDetails.message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onRetry && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                  className="text-xs"
                >
                  {retryLabel}
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onDismiss}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {dismissLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 