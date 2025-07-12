import React, { useState, useEffect } from 'react';
import { Message } from '@/types/message';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showTail?: boolean;
  isGroupChat?: boolean; // グループチャットかどうか
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showAvatar = true, showTail = true, isGroupChat = false }) => {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    const formatTime = (date: Date) => {
      return new Date(date).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    setFormattedTime(formatTime(message.timestamp));
  }, [message.timestamp]);

  return (
    <div className={`flex mb-[7px] items-start ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && showAvatar && (
        <div className="w-7 h-7 rounded-full bg-gray-300 flex-shrink-0 mr-3 overflow-hidden -mt-1">
          {message.avatarSettings?.url ? (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${message.avatarSettings.url})`,
                backgroundSize: `${message.avatarSettings.scale * 100}%`,
                backgroundPosition: `${message.avatarSettings.positionX}% ${message.avatarSettings.positionY}%`
              }}
            />
          ) : message.avatar ? (
            <img src={message.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">
              {message.userName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      )}
      
      {/* アバターがない場合のスペーサー */}
      {!message.isUser && !showAvatar && (
        <div className="w-7 mr-3"></div>
      )}
      
      {/* 自分のメッセージの場合、左側に時刻と既読を表示 */}
      {message.isUser && (
        <div className="flex flex-col items-end mr-2 self-end -space-y-1">
          {message.isRead && (
            <div className="text-[10px] text-gray-500">
              既読
            </div>
          )}
          <div className="text-[10px] text-gray-500">
            {formattedTime}
          </div>
        </div>
      )}
      
      <div>
        {/* 相手のメッセージで、グループチャット（3人以上）かつグループの最初の場合は名前を表示 */}
        {!message.isUser && showAvatar && isGroupChat && (
          <div className="text-xs text-gray-600 mb-1 ml-1">
            {message.userName || 'サンプルユーザー'}
          </div>
        )}
        <div className={`relative max-w-xs lg:max-w-sm ${
          message.imageUrl ? '' : 'px-3 py-1'
        } text-sm leading-relaxed ${
          message.isUser 
            ? 'bg-[#6de67b] text-black rounded-3xl'
            : 'bg-white text-black rounded-3xl border border-gray-200 shadow-sm'
        }`}>
          {message.imageUrl ? (
            <div className="overflow-hidden rounded-3xl">
              <img 
                src={message.imageUrl} 
                alt="送信画像" 
                className="max-w-full h-auto"
                style={{ maxHeight: '300px' }}
              />
              {message.text && message.text.trim() !== ' ' && (
                <div className="px-3 py-1 whitespace-pre-wrap break-words">
                  {message.text}
                </div>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}
        
        {/* 吹き出しの矢印（showTailがtrueの場合のみ表示） */}
        {!message.isUser && showTail && (
          <div className="absolute left-2 top-[2px] transform -translate-x-[6px]" style={{transform: 'translateX(-6px) rotate(140deg)'}}>
            <div className="w-0 h-0 border-r-[12px] border-r-white border-b-[17px] border-b-transparent"></div>
          </div>
        )}
        {message.isUser && showTail && (
          <div className="absolute right-2 top-[2px] transform translate-x-[6px]" style={{transform: 'translateX(6px) rotate(-140deg)'}}>
            <div className="w-0 h-0 border-l-[12px] border-l-[#6de67b] border-b-[17px] border-b-transparent"></div>
          </div>
        )}
        </div>
      </div>
      
      {/* 相手のメッセージの場合、右側に時刻を表示 */}
      {!message.isUser && (
        <div className="flex flex-col ml-2 self-end">
          <div className="text-[10px] text-gray-500">
            {formattedTime}
          </div>
        </div>
      )}
    </div>
  );
};