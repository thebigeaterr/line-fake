import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { AiOutlinePlus } from 'react-icons/ai';
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
    <div className="bg-white border-t border-gray-300 px-3 py-2">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          disabled={disabled}
        >
          <AiOutlinePlus size={22} />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50"
            rows={1}
            disabled={disabled}
            style={{ 
              minHeight: '44px', 
              maxHeight: '120px',
              lineHeight: '1.4'
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            disabled={disabled}
          >
            <BsEmojiSmile size={18} />
          </button>
        </div>
        
        <button
          type="submit"
          className={`flex-shrink-0 p-2.5 rounded-full transition-all ${
            message.trim() && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!message.trim() || disabled}
        >
          <IoSend size={18} />
        </button>
      </form>
    </div>
  );
};