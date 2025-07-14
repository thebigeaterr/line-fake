import React from 'react';
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
    <div className="bg-[#8cabd8]/50 backdrop-blur-sm py-3 flex items-center justify-between" style={{ paddingLeft: '0', paddingRight: '0.9375rem' }}>
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="text-black hover:text-gray-600"
          style={{ width: '10px', height: '18px', padding: 0, marginLeft: '16px', border: 'none', background: 'transparent' }}
        >
          <img src="/back-icon.svg" alt="戻る" style={{ width: '10px !important', height: '18px !important', display: 'block' }} />
        </button>
        
        <div style={{ marginLeft: '16px' }}>
          <h2 className="font-semibold text-black" style={{ fontSize: '1rem' }}>{roomName}</h2>
        </div>
      </div>
      
      <div className="flex items-center" style={{ gap: '20px' }}>
        <button className="text-black hover:text-gray-600" style={{ width: '20px', height: '20px', padding: 0 }}>
          <img src="/search-icon.svg" alt="検索" width={20} height={20} />
        </button>
        <button className="text-black hover:text-gray-600" style={{ width: '19px', height: '19px', padding: 0 }}>
          <img src="/phone-icon.svg" alt="電話" width={19} height={19} />
        </button>
        <button 
          onClick={onMenuClick}
          className="text-black hover:text-gray-600"
          style={{ width: '16px', height: '16px', padding: 0 }}
        >
          <img src="/menu-icon.svg" alt="メニュー" width={16} height={16} />
        </button>
      </div>
    </div>
  );
};