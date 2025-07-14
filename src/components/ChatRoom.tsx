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
  isGroupChat?: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomName,
  roomAvatar,
  roomAvatarSettings,
  messages,
  onSendMessage,
  onBack,
  onMenuClick,
  isGroupChat = false
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
        className="flex-1 overflow-y-auto px-2 pt-6"
        style={{ paddingBottom: '0.375rem', scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => {
          // 余白を計算
          let marginBottom = '0.375rem'; // デフォルト6px
          
          // 現在のメッセージがスタンプの場合
          if (message.imageUrl && message.isStamp) {
            marginBottom = '15px'; // スタンプのデフォルト余白
            
            // 次のメッセージが存在する場合
            if (index < messages.length - 1) {
              const nextMessage = messages[index + 1];
              // 次のメッセージもスタンプかつ送信者が異なる場合
              if (nextMessage.imageUrl && nextMessage.isStamp && 
                  message.isUser !== nextMessage.isUser) {
                marginBottom = '22px';
              }
            }
          } else if (index < messages.length - 1) {
            // 現在のメッセージが通常メッセージで、次がスタンプの場合
            const nextMessage = messages[index + 1];
            if (nextMessage.imageUrl && nextMessage.isStamp) {
              marginBottom = '15px';
            }
          }
          
          // 最後のメッセージの場合の処理
          const isLastMessage = index === messages.length - 1;
          let finalMarginBottom = marginBottom;
          
          if (isLastMessage) {
            // 最後のメッセージの場合、margin-bottomを0にしてpaddingBottomで調整
            finalMarginBottom = '0';
            // スタンプの場合は追加のパディングが必要
            if (message.imageUrl && message.isStamp) {
              // スタンプの場合は16px - 6px(既存padding) = 10px追加
              finalMarginBottom = '10px';
            }
          }
          
          return (
            <div key={message.id} style={{ marginBottom: finalMarginBottom }}>
              <MessageBubble 
                message={message} 
                showAvatar={shouldShowAvatar(index)}
                showTail={shouldShowTail(index)}
                isGroupChat={isGroupChat}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>
      
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};