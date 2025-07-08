import React from 'react';
import { IoCall, IoMenu, IoChevronBack, IoSearch } from 'react-icons/io5';
import { AvatarSettings } from '@/types/message';

interface ChatHeaderProps {
  roomName: string;
  roomAvatar?: string;
  roomAvatarSettings?: AvatarSettings;
  onBack: () => void;
  onMenuClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  roomName, 
  roomAvatar, 
  roomAvatarSettings,
  onBack, 
  onMenuClick 
}) => {
  return (
    <div className="bg-[#8cabd8]/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-1 text-black hover:text-gray-600"
        >
          <IoChevronBack size={24} />
        </button>
        
        <div>
          <h2 className="text-lg font-semibold text-black">{roomName}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button className="p-2 text-black hover:text-gray-600">
          <IoSearch size={20} />
        </button>
        <button className="p-2 text-black hover:text-gray-600">
          <IoCall size={20} />
        </button>
        <button 
          onClick={onMenuClick}
          className="p-2 text-black hover:text-gray-600"
        >
          <IoMenu size={20} />
        </button>
      </div>
    </div>
  );
};