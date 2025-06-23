import React, { useState, useRef, type KeyboardEvent } from 'react';
import { Button, Icon } from './index';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`flex items-start gap-2 p-4 border-t border-gray-200 bg-white ${className}`}>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`
            w-full resize-none rounded-lg border border-gray-300 px-3 py-2 pr-12
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            text-sm leading-5
          `}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        
        {/* Character count */}
        {message.length > maxLength * 0.8 && (
          <div className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white px-1">
            {message.length}/{maxLength}
          </div>
        )}
      </div>
      
      <Button
        onClick={handleSend}
        disabled={!canSend}
        size="md"
        className="flex-shrink-0 mt-1"
        aria-label="Send message"
      >
        <Icon name="send" size={16} />
      </Button>
    </div>
  );
};

export default MessageInput; 