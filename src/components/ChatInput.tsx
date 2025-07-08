import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { HiOutlinePlus, HiOutlineCamera, HiOutlinePhotograph, HiOutlineMicrophone } from 'react-icons/hi';
import { HiOutlineEmojiHappy } from 'react-icons/hi';

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
    <div className="bg-white px-2 pt-3 pb-5">
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {/* Left side icons */}
        <div className="flex items-center space-x-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <rect x="3" y="6" width="18" height="12" rx="2"/>
            <rect x="8" y="3" width="8" height="3" rx="1"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 13l5-4 5 6 4-3 4 4"/>
          </svg>
        </div>
        
        {/* Center input area */}
        <div className="flex-1 mx-2 flex items-center bg-gray-100 rounded-3xl px-3" style={{height: '28px'}}>
          <span className="text-gray-300 text-sm mr-2">Aa</span>
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
                minHeight: '28px', 
                maxHeight: '120px',
                lineHeight: '1.4'
              }}
            />
          </form>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 ml-2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="8.5" cy="10" r="0.5" fill="currentColor"/>
            <circle cx="15.5" cy="10" r="0.5" fill="currentColor"/>
            <path d="M7 13.5s2.5 3 5 3 5-3 5-3"/>
          </svg>
        </div>
        
        {/* Right side icon */}
        <div className="flex-shrink-0">
          {message.trim() ? (
            <IoSend size={22} className="text-blue-500" onClick={handleSubmit} />
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
              <rect x="9" y="3" width="6" height="11" rx="3"/>
              <path d="M5 11c0 3.9 3.1 7 7 7s7-3.1 7-7"/>
              <path d="M12 18v3"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};