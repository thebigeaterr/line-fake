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
        hour: 'numeric', 
        minute: '2-digit' 
      });
    };
    
    setFormattedTime(formatTime(message.timestamp));
  }, [message.timestamp]);

  // 日付セパレーターの場合は特別な表示
  if (message.isDateSeparator) {
    return (
      <div className="flex justify-center" style={{ marginTop: '8px', marginBottom: '8px' }}>
        <div className="bg-[#768FB7] text-white rounded-full" style={{ fontSize: '10px', paddingLeft: '9px', paddingRight: '9px', paddingTop: '4px', paddingBottom: '4px' }}>
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && showAvatar && (
        <div className="rounded-full bg-gray-300 flex-shrink-0 overflow-hidden" style={{ width: '30px', height: '30px', marginRight: '12px', marginTop: '-4px' }}>
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
        <div style={{ width: '30px', marginRight: '12px' }}></div>
      )}
      
      {/* 自分のメッセージの場合、左側に時刻と既読を表示 */}
      {message.isUser && (
        <div className="flex flex-col items-end" style={{ 
          alignSelf: 'flex-end', 
          marginBottom: '0.375rem', 
          marginRight: message.imageUrl && message.isStamp ? '16px' : '0.3125rem' 
        }}>
          {message.isRead && (
            <div className="text-gray-500" style={{ fontSize: '0.5625rem', lineHeight: '1', marginBottom: '0.1875rem' }}>
              既読
            </div>
          )}
          <div className="text-gray-500" style={{ fontSize: '0.5625rem', lineHeight: '1' }}>
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
        <div className={`relative ${
          message.imageUrl && message.isStamp ? '' : ''
        } ${
          message.imageUrl && message.isStamp ? '' : (
            message.isUser 
              ? 'bg-[#6de67b] text-black'
              : 'bg-white text-black border border-gray-200 shadow-sm'
          )
        }`} style={{ 
          fontSize: '0.9375rem', 
          padding: message.imageUrl ? '0' : '0.5rem 15px', 
          lineHeight: '1.2',
          maxWidth: message.imageUrl && message.isStamp ? 'none' : '258px',
          textAlign: 'left',
          whiteSpace: message.imageUrl ? 'normal' : 'pre-wrap',
          wordBreak: message.imageUrl ? 'normal' : 'break-word',
          borderRadius: message.imageUrl && message.isStamp ? '0' : '18px'
        }}>
          {message.imageUrl ? (
            <div className={message.isStamp ? "" : "overflow-hidden"} style={{ borderRadius: message.isStamp ? '0' : '18px' }}>
              <img 
                src={message.imageUrl} 
                alt={message.isStamp ? "スタンプ" : "送信画像"} 
                className="block"
                style={message.isStamp ? 
                  { width: '183px', height: '158px', objectFit: 'fill' } : 
                  { maxWidth: '100%', height: 'auto', maxHeight: '15rem' }
                }
              />
            </div>
          ) : (
            message.text
          )}
        
        {/* 吹き出しの矢印（showTailがtrueかつ画像メッセージでない場合のみ表示） */}
        {!message.isUser && showTail && !message.imageUrl && (
          <div className="absolute left-2 top-[2px] transform -translate-x-[6px]" style={{transform: 'translateX(-6px) rotate(140deg)'}}>
            <div className="w-0 h-0 border-r-[12px] border-r-white border-b-[17px] border-b-transparent"></div>
          </div>
        )}
        {message.isUser && showTail && !message.imageUrl && (
          <div className="absolute right-2 top-[2px] transform translate-x-[6px]" style={{transform: 'translateX(6px) rotate(-140deg)'}}>
            <div className="w-0 h-0 border-l-[12px] border-l-[#6de67b] border-b-[17px] border-b-transparent"></div>
          </div>
        )}
        </div>
      </div>
      
      {/* 相手のメッセージの場合、右側に時刻を表示 */}
      {!message.isUser && (
        <div className="flex flex-col" style={{ 
          alignSelf: 'flex-end', 
          marginBottom: '0.375rem', 
          marginLeft: message.imageUrl && message.isStamp ? '16px' : '0.3125rem' 
        }}>
          <div className="text-gray-500" style={{ fontSize: '0.5625rem', lineHeight: '1' }}>
            {formattedTime}
          </div>
        </div>
      )}
    </div>
  );
};