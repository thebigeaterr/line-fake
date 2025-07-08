import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface NewChatModalProps {
  onClose: () => void;
  onCreate: (name: string, isGroup: boolean) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onCreate }) => {
  const [roomName, setRoomName] = useState('');
  const [isGroup, setIsGroup] = useState(false);

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreate(roomName.trim(), isGroup);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">新しいトーク</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トーク名
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              placeholder="トーク名を入力"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">グループチャットとして作成</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleCreate}
            disabled={!roomName.trim()}
            className={`flex-1 px-4 py-2 rounded-lg ${
              roomName.trim()
                ? 'bg-[#06C755] text-white hover:bg-[#05B04B]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};