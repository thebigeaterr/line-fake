import React, { useState } from 'react';
import { IoSend, IoAdd, IoCamera, IoImage, IoMic } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white px-2 py-2">
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {/* Left side icons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-800"
            disabled={disabled}
          >
            <IoAdd size={22} />
          </button>
          
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-800"
            disabled={disabled}
          >
            <IoCamera size={22} />
          </button>
          
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-800"
            disabled={disabled}
          >
            <IoImage size={22} />
          </button>
        </div>
        
        {/* Center input area */}
        <div className="flex-1 mx-2 flex items-center bg-gray-100 rounded-3xl px-3 py-2">
          <span className="text-gray-500 text-sm mr-2">Aa</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder=""
              className="w-full bg-transparent resize-none focus:outline-none text-base"
              rows={1}
              disabled={disabled}
              style={{ 
                minHeight: '24px', 
                maxHeight: '120px',
                lineHeight: '1.4'
              }}
            />
          </form>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 ml-2"
            disabled={disabled}
          >
            <BsEmojiSmile size={18} />
          </button>
        </div>
        
        {/* Right side icon */}
        <div className="flex-shrink-0">
          {message.trim() ? (
            <button
              type="submit"
              onClick={handleSubmit}
              className="p-2 text-blue-500 hover:text-blue-600"
              disabled={disabled}
            >
              <IoSend size={22} />
            </button>
          ) : (
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-gray-800"
              disabled={disabled}
            >
              <IoMic size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};