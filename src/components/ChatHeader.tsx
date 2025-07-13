import React from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { HiOutlinePhone } from 'react-icons/hi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { AvatarSettings } from '@/types/message';

interface ChatHeaderProps {
  roomName: string;
  roomAvatar?: string;
  roomAvatarSettings?: AvatarSettings | null;
  onBack: () => void;
  onMenuClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  roomName, 
  // roomAvatar, 
  // roomAvatarSettings,
  onBack, 
  onMenuClick 
}) => {
  return (
    <div className="bg-[#8cabd8]/50 backdrop-blur-sm py-3 flex items-center justify-between" style={{ paddingLeft: '0.9375rem', paddingRight: '0.9375rem' }}>
      <div className="flex items-center space-x-1">
        <button
          onClick={onBack}
          className="p-1 text-black hover:text-gray-600"
        >
          <IoChevronBack size={24} />
        </button>
        
        <div>
          <h2 className="font-semibold text-black" style={{ fontSize: '1rem' }}>{roomName}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button className="p-2 text-black hover:text-gray-600">
          <svg width="19.5" height="19.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <path d="M11 11v-4"/>
            <path d="M11 11l3.3 2.6"/>
          </svg>
        </button>
        <button className="p-2 text-black hover:text-gray-600">
          <HiOutlinePhone size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={onMenuClick}
          className="p-2 text-black hover:text-gray-600"
        >
          <RxHamburgerMenu size={20} />
        </button>
      </div>
    </div>
  );
};