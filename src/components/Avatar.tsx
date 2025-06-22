import React from 'react';
import Icon from './Icon';

export interface AvatarProps {
  type: 'user' | 'bot';
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  type,
  size = 'md',
  src,
  alt,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };
  
  const baseClasses = `flex items-center justify-center rounded-full flex-shrink-0 ${sizeClasses[size]}`;
  
  const typeClasses = {
    user: 'bg-blue-100 text-blue-600',
    bot: 'bg-gray-100 text-gray-600'
  };
  
  const classes = `${baseClasses} ${typeClasses[type]} ${className}`;
  
  // If we have a custom image source, use it
  if (src) {
    return (
      <img
        src={src}
        alt={alt || `${type} avatar`}
        className={`${baseClasses} object-cover ${className}`}
        onError={(e) => {
          // Fallback to icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }
  
  // Default to icon-based avatar
  return (
    <div className={classes}>
      <Icon 
        name={type === 'user' ? 'user' : 'bot'} 
        size={iconSizes[size]}
      />
    </div>
  );
};

export default Avatar; 