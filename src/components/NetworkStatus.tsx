import React, { useState, useEffect } from 'react';
import { Icon } from './index';

export type NetworkStatusType = 'online' | 'offline' | 'reconnecting' | 'error';

export interface NetworkStatusProps {
  status?: NetworkStatusType;
  onRetry?: () => void;
  className?: string;
  showLabel?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  status = 'online',
  onRetry,
  className = '',
  showLabel = true,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide for online status
  useEffect(() => {
    if (status === 'online' && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [status, autoHide, autoHideDelay]);

  const getStatusDetails = () => {
    switch (status) {
      case 'online':
        return {
          label: 'Connected',
          icon: 'chevron-up',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
        };
      case 'offline':
        return {
          label: 'No connection',
          icon: 'close',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
        };
      case 'reconnecting':
        return {
          label: 'Reconnecting...',
          icon: 'loading',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
        };
      case 'error':
        return {
          label: 'Connection error',
          icon: 'close',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
        };
      default:
        return {
          label: 'Unknown status',
          icon: 'close',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
        };
    }
  };

  const details = getStatusDetails();

  // Don't render if set to auto-hide and not visible
  if (!isVisible && status === 'online') {
    return null;
  }

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium
      ${details.bgColor} ${details.textColor} ${details.borderColor}
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      <Icon 
        name={details.icon as any} 
        size={12} 
        className={`${details.iconColor} ${status === 'reconnecting' ? 'animate-spin' : ''}`}
      />
      
      {showLabel && (
        <span>{details.label}</span>
      )}
      
      {(status === 'offline' || status === 'error') && onRetry && (
        <button
          onClick={onRetry}
          className={`
            ml-1 px-2 py-1 rounded text-xs font-medium
            ${details.textColor} hover:bg-white hover:bg-opacity-50
            transition-colors duration-200
          `}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default NetworkStatus; 