import React, { useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message, AvatarSettings } from '@/types/message';

interface ChatRoomProps {
  roomName: string;
  roomAvatar?: string;
  roomAvatarSettings?: AvatarSettings | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBack: () => void;
  onMenuClick?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomName,
  roomAvatar,
  roomAvatarSettings,
  messages,
  onSendMessage,
  onBack,
  onMenuClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 初回マウント時は即座にスクロール
  useEffect(() => {
    scrollToBottom();
  }, []);

  // メッセージ変更時はスムーズスクロール
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottomSmooth();
    }, 50); // 少し遅延を入れてDOMの更新を待つ
    
    return () => clearTimeout(timer);
  }, [messages]);

  // メッセージのグループ化判定
  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    
    const currentMessage = messages[currentIndex];
    const prevMessage = messages[currentIndex - 1];
    
    // 送信者が違う場合はアバター表示
    if (currentMessage.isUser !== prevMessage.isUser) return true;
    
    // 時刻が違う場合はアバター表示（時間と分で比較）
    const currentTime = new Date(currentMessage.timestamp);
    const prevTime = new Date(prevMessage.timestamp);
    
    return currentTime.getHours() !== prevTime.getHours() || 
           currentTime.getMinutes() !== prevTime.getMinutes();
  };

  const shouldShowTail = (currentIndex: number) => {
    // 最初のメッセージは矢印表示
    if (currentIndex === 0) return true;
    
    const currentMessage = messages[currentIndex];
    const prevMessage = messages[currentIndex - 1];
    
    // 送信者が違う場合は矢印表示（グループの最初）
    if (currentMessage.isUser !== prevMessage.isUser) return true;
    
    // 前のメッセージと時刻が違う場合は矢印表示（グループの最初）
    const currentTime = new Date(currentMessage.timestamp);
    const prevTime = new Date(prevMessage.timestamp);
    
    return currentTime.getHours() !== prevTime.getHours() || 
           currentTime.getMinutes() !== prevTime.getMinutes();
  };

  return (
    <div className="flex flex-col h-screen bg-[#8cabd8]">
      <ChatHeader
        roomName={roomName}
        roomAvatar={roomAvatar}
        roomAvatarSettings={roomAvatarSettings}
        onBack={onBack}
        onMenuClick={onMenuClick}
      />
      
      <div 
        ref={messagesContainerRef}
        data-chat-container
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            showAvatar={shouldShowAvatar(index)}
            showTail={shouldShowTail(index)}
          />
        ))}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>
      
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};