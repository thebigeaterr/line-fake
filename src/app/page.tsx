'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/components/ChatRoom';
import { AdminPanel } from '@/components/AdminPanel';
import { ChatRoomList } from '@/components/ChatRoomList';
import { NewChatModal } from '@/components/NewChatModal';
import { useChatRooms } from '@/hooks/useChatRooms';
import { Message, AvatarSettings } from '@/types/message';

type ViewMode = 'list' | 'chat' | 'admin';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { 
    chatRooms, 
    currentRoomId, 
    setCurrentRoomId, 
    getCurrentRoom, 
    createChatRoom, 
    deleteChatRoom, 
    addMessage, 
    updateChatRoom, 
    resetUnreadCount,
    // clearAllData 
  } = useChatRooms();

  const currentRoom = getCurrentRoom();

  const handleSendMessage = (message: string) => {
    if (currentRoomId) {
      addMessage(currentRoomId, message, true);
    }
  };

  const handleMenuClick = () => {
    setViewMode('admin');
  };

  const handleBackToChat = () => {
    setViewMode('chat');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentRoomId(null);
  };

  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    resetUnreadCount(roomId);
    setViewMode('chat');
  };

  const handleCreateRoom = () => {
    setShowNewChatModal(true);
  };

  const handleConfirmCreateRoom = (name: string, isGroup: boolean) => {
    const newRoomId = createChatRoom(name, isGroup);
    setCurrentRoomId(newRoomId);
    setShowNewChatModal(false);
    setViewMode('chat');
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteChatRoom(roomId);
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

  const handleUpdateMessages = (newMessages: Message[], updatedUserData?: Record<string, unknown>) => {
    if (currentRoomId) {
      updateChatRoom(currentRoomId, newMessages, updatedUserData);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#7494c0] shadow-2xl h-screen overflow-hidden">
      {viewMode === 'list' ? (
        <div className="h-full">
          <ChatRoomList
            chatRooms={chatRooms}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        </div>
      ) : viewMode === 'chat' && currentRoom ? (
        <div className="chat-slide-in h-full">
          <ChatRoom
            roomName={currentRoom.name}
            roomAvatarSettings={currentRoom.participants[1]?.avatarSettings as AvatarSettings}
            messages={currentRoom.messages}
            onSendMessage={handleSendMessage}
            onBack={handleBackToList}
            onMenuClick={handleMenuClick}
            isGroupChat={currentRoom.isGroup && currentRoom.participants.length >= 3}
          />
        </div>
      ) : viewMode === 'admin' && currentRoom ? (
        <div className="admin-panel-slide-in h-full">
          <AdminPanel
            messages={currentRoom.messages}
            onUpdateMessages={handleUpdateMessages}
            onBack={handleBackToChat}
            initialUserData={{
              otherUserName: currentRoom.participants[1]?.name || 'ユーザー',
              otherAvatarSettings: currentRoom.participants[1]?.avatarSettings as AvatarSettings,
              userAvatarSettings: currentRoom.participants[0]?.avatarSettings as AvatarSettings,
              participants: currentRoom.participants,
              isGroup: currentRoom.isGroup
            }}
          />
        </div>
      ) : null}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreate={handleConfirmCreateRoom}
        />
      )}
    </div>
  );
}