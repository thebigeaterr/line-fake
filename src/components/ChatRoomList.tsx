import React, { useState, useEffect } from 'react';
import { IoAdd, IoTrash, IoPeople, IoPerson } from 'react-icons/io5';
import { Message, AvatarSettings } from '@/types/message';

export interface ChatRoomData {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isGroup: boolean;
  participants: Array<{
    id: string;
    name: string;
    avatarSettings: unknown;
  }>;
  messages: Message[];
}

interface ChatRoomListProps {
  chatRooms: ChatRoomData[];
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  isEditing?: boolean;
  // onClearAllData?: () => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  isLoading = false,
  error = null,
  isEditing = false,
  // onClearAllData
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    // 今日の場合は時刻のみ
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 昨日の場合
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return '昨日';
    }
    
    // それ以外は日付
    return messageDate.toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setShowDeleteConfirm(roomId);
  };

  const confirmDelete = (roomId: string) => {
    onDeleteRoom(roomId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0]">
      {/* Header */}
      <div className="bg-[#273246] px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">トーク</h1>
        <button
          onClick={onCreateRoom}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors ${
            isLoading 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-white hover:bg-white/10'
          }`}
        >
          <IoAdd size={24} />
        </button>
      </div>

      {/* Error notification */}
      {error && chatRooms.length > 0 && (
        <div className="px-4 py-2 bg-yellow-100 border-b border-yellow-400 text-yellow-700 text-sm">
          <span className="font-medium">注意:</span> {error}
        </div>
      )}
      
      {/* Editing status notification */}
      {isEditing && (
        <div className="px-4 py-2 bg-blue-100 border-b border-blue-400 text-blue-700 text-sm">
          <span className="font-medium">編集中:</span> 他の端末からの同期を一時停止しています
        </div>
      )}

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06C755] mb-4"></div>
            <p>読み込み中...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {error && (
              <div className="mb-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <p className="mb-4">トークルームがありません</p>
            <button
              onClick={onCreateRoom}
              className="px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B]"
            >
              新しいトークを開始
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 bg-white">
            {chatRooms
              .sort((a, b) => {
                // lastMessageTimeで降順ソート（新しいものが上）
                const aTime = a.lastMessageTime?.getTime() || 0;
                const bTime = b.lastMessageTime?.getTime() || 0;
                return bTime - aTime;
              })
              .map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer relative group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 mr-3 overflow-hidden">
                  {(() => {
                    const participant = room.participants[1];
                    const avatarSettings = participant?.avatarSettings as AvatarSettings;
                    console.log('ChatRoomList - Room:', room.id, 'Participant[1]:', participant, 'AvatarSettings:', avatarSettings);
                    
                    if (avatarSettings?.url) {
                      return (
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${avatarSettings.url})`,
                            backgroundSize: `${avatarSettings.scale * 100}%`,
                            backgroundPosition: `${avatarSettings.positionX}% ${avatarSettings.positionY}%`
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          {room.isGroup ? (
                            <IoPeople size={24} className="text-gray-600" />
                          ) : (
                            <IoPerson size={24} className="text-gray-600" />
                          )}
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {room.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {isClient ? formatTime(room.lastMessageTime) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {room.lastMessage || 'メッセージはありません'}
                  </p>
                </div>

                {/* Unread Badge */}
                {room.unreadCount != null && room.unreadCount > 0 && (
                  <div className="absolute right-4 bottom-3 bg-[#06C755] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {room.unreadCount}
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(e, room.id)}
                  className="absolute right-2 top-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 border border-gray-200"
                >
                  <IoTrash size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">トークを削除</h3>
            <p className="text-gray-600 mb-6">
              このトークルームを削除してもよろしいですか？
              <br />
              <span className="text-sm text-red-500">この操作は取り消せません。</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};