import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
// import { HiOutlinePlus, HiOutlineCamera, HiOutlinePhotograph, HiOutlineMicrophone } from 'react-icons/hi';
// import { HiOutlineEmojiHappy } from 'react-icons/hi';

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
    <div className="bg-white" style={{ height: '85px', paddingTop: '9px' }}>
      <div className="flex items-center w-full max-w-md mx-auto">
        {/* Spacer */}
        <div className="w-3"></div>
        
        {/* Plus icon */}
        <div className="w-7 h-7 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <line x1="11" y1="2.5" x2="11" y2="19.5"/>
            <line x1="2.5" y1="11" x2="19.5" y2="11"/>
          </svg>
        </div>
        
        {/* Spacer */}
        <div className="w-3"></div>
        
        {/* Camera icon */}
        <div className="w-7 h-7 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <path d="M3 7.25v12.5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.25a2 2 0 0 0-2-2H15l-1-1a1 1 0 0 0-1 0h-2a1 1 0 0 0-1 0l-1 1H5a2 2 0 0 0-2 2z"/>
            <circle cx="12" cy="13.5" r="3.5"/>
          </svg>
        </div>
        
        {/* Spacer */}
        <div className="w-3"></div>
        
        {/* Image icon */}
        <div className="w-7 h-7 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-gray-600">
            <rect x="3" y="3.5" width="18" height="18" rx="2"/>
            <path d="M3 13.5l5-4 5 6 4-3 4 4"/>
          </svg>
        </div>
        
        {/* Spacer */}
        <div className="w-3"></div>
        
        {/* Center input area */}
        <div className="flex-1 flex items-center bg-gray-100 rounded-3xl px-3" style={{height: '28px'}}>
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
        
        {/* Spacer */}
        <div className="w-3"></div>
        
        {/* Right side icon */}
        <div className="w-7 h-7 flex items-center justify-center">
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
        
        {/* Spacer */}
        <div className="w-3"></div>
      </div>
    </div>
  );
};