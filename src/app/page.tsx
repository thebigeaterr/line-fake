'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/components/ChatRoom';
import { AdminPanel } from '@/components/AdminPanel';
import { useMessages } from '@/hooks/useMessages';

type ViewMode = 'chat' | 'admin';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const { messages, userData, addMessage, updateMessages, updateUserData } = useMessages();

  const handleSendMessage = (message: string) => {
    addMessage(message, true);
  };

  const handleMenuClick = () => {
    setViewMode('admin');
  };

  const handleBackToChat = () => {
    setViewMode('chat');
  };

  // 画面切り替え時にスクロール位置をリセット
  useEffect(() => {
    if (viewMode === 'chat') {
      // チャット画面に戻った時、少し遅延してスクロール
      const timer = setTimeout(() => {
        const container = document.querySelector('[data-chat-container]') as HTMLElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const handleUpdateMessages = (newMessages: any[], updatedUserData?: any) => {
    updateMessages(newMessages);
    
    // ユーザーデータが渡された場合は更新
    if (updatedUserData) {
      updateUserData(updatedUserData);
    } else {
      // メッセージから相手の名前とアバター設定を抽出
      const firstOtherMessage = newMessages.find(msg => !msg.isUser);
      if (firstOtherMessage) {
        const newUserData: any = {};
        if (firstOtherMessage.userName && firstOtherMessage.userName !== userData.otherUserName) {
          newUserData.otherUserName = firstOtherMessage.userName;
        }
        if (firstOtherMessage.avatarSettings && firstOtherMessage.avatarSettings !== userData.otherAvatarSettings) {
          newUserData.otherAvatarSettings = firstOtherMessage.avatarSettings;
        }
        if (Object.keys(newUserData).length > 0) {
          updateUserData(newUserData);
        }
      }
    }
  };

  console.log('App userData:', userData); // デバッグ用

  return (
    <div className="w-full max-w-md mx-auto bg-[#7494c0] shadow-2xl h-screen overflow-hidden">
      {viewMode === 'chat' ? (
        <div className="chat-slide-in h-full">
          <ChatRoom
            roomName={userData?.otherUserName || 'サンプルユーザー'}
            roomAvatarSettings={userData?.otherAvatarSettings}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => console.log('Back pressed')}
            onMenuClick={handleMenuClick}
          />
        </div>
      ) : (
        <div className="admin-panel-slide-in h-full">
          <AdminPanel
            messages={messages}
            onUpdateMessages={handleUpdateMessages}
            onBack={handleBackToChat}
          />
        </div>
      )}
    </div>
  );
}