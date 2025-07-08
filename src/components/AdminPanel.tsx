import React, { useState, useEffect, useRef } from 'react';
import { IoAdd, IoTrash, IoSend, IoImage, IoClose, IoChevronBack } from 'react-icons/io5';
import { Message, AvatarSettings } from '@/types/message';
import { MessageBubble } from './MessageBubble';
import { AvatarEditor } from './AvatarEditor';

interface AdminPanelProps {
  messages: Message[];
  onUpdateMessages: (messages: Message[], userData?: any) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  messages,
  onUpdateMessages,
  onBack
}) => {
  const [editingMessages, setEditingMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageIsUser, setNewMessageIsUser] = useState(false);
  const [newMessageTimestamp, setNewMessageTimestamp] = useState('');
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTimestamp, setEditingTimestamp] = useState('');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [editingAvatarFor, setEditingAvatarFor] = useState<'user' | 'other' | null>(null);
  const [userAvatarSettings, setUserAvatarSettings] = useState<AvatarSettings | null>(null);
  const [otherAvatarSettings, setOtherAvatarSettings] = useState<AvatarSettings | null>(null);
  const [otherUserName, setOtherUserName] = useState('サンプルユーザー');
  const [showNameEditor, setShowNameEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 既存のメッセージで自分のメッセージに既読状態がない場合は既読に設定
    const messagesWithReadStatus = messages.map(msg => ({
      ...msg,
      isRead: msg.isUser && msg.isRead === undefined ? true : msg.isRead
    }));
    setEditingMessages(messagesWithReadStatus);
    
    // メッセージから現在のユーザーデータを抽出
    const firstOtherMessage = messages.find(msg => !msg.isUser);
    if (firstOtherMessage) {
      if (firstOtherMessage.userName) {
        setOtherUserName(firstOtherMessage.userName);
      }
      if (firstOtherMessage.avatarSettings) {
        setOtherAvatarSettings(firstOtherMessage.avatarSettings);
      }
    }
    
    // あなたのメッセージからアバター設定を抽出
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (firstUserMessage && firstUserMessage.avatarSettings) {
      setUserAvatarSettings(firstUserMessage.avatarSettings);
    }
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // AdminPanelは少し長めの遅延
    
    return () => clearTimeout(timer);
  }, [editingMessages]);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const timestamp = newMessageTimestamp 
        ? new Date(newMessageTimestamp) 
        : new Date();
        
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        isUser: newMessageIsUser,
        timestamp: timestamp,
        userName: newMessageIsUser ? 'あなた' : otherUserName,
        avatarSettings: newMessageIsUser ? userAvatarSettings : otherAvatarSettings,
        isRead: newMessageIsUser ? true : undefined // 自分のメッセージは既読で開始
      };
      
      setEditingMessages([...editingMessages, message]);
      setNewMessage('');
      setNewMessageTimestamp('');
      setShowAdvancedAdd(false);
    }
  };

  const handleOpenAvatarEditor = (forUser: 'user' | 'other') => {
    setEditingAvatarFor(forUser);
    setShowAvatarEditor(true);
  };

  const handleSaveAvatarSettings = (settings: AvatarSettings | null) => {
    if (editingAvatarFor === 'user') {
      setUserAvatarSettings(settings);
      // 既存の自分のメッセージにも適用
      setEditingMessages(editingMessages.map(msg => 
        msg.isUser ? { ...msg, avatarSettings: settings } : msg
      ));
    } else if (editingAvatarFor === 'other') {
      setOtherAvatarSettings(settings);
      // 既存の相手のメッセージにも適用
      setEditingMessages(editingMessages.map(msg => 
        !msg.isUser ? { ...msg, avatarSettings: settings, userName: otherUserName } : msg
      ));
    }
  };

  const formatDateTimeForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleStartEdit = (id: string, text: string, timestamp: Date) => {
    setEditingMessageId(id);
    setEditingText(text);
    setEditingTimestamp(formatDateTimeForInput(timestamp));
  };

  const handleSaveEdit = () => {
    if (editingMessageId) {
      const newTimestamp = new Date(editingTimestamp);
      setEditingMessages(editingMessages.map(msg => 
        msg.id === editingMessageId ? { 
          ...msg, 
          text: editingText,
          timestamp: newTimestamp
        } : msg
      ));
      setEditingMessageId(null);
      setEditingText('');
      setEditingTimestamp('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
    setEditingTimestamp('');
  };

  const handleDeleteMessage = (id: string) => {
    setEditingMessages(editingMessages.filter(msg => msg.id !== id));
  };

  const handleToggleMessageType = (id: string) => {
    setEditingMessages(editingMessages.map(msg => 
      msg.id === id ? { 
        ...msg, 
        isUser: !msg.isUser,
        isRead: !msg.isUser ? true : undefined // ユーザーメッセージに変更時は既読にリセット
      } : msg
    ));
  };

  const handleToggleReadStatus = (id: string) => {
    setEditingMessages(editingMessages.map(msg => 
      msg.id === id && msg.isUser ? { ...msg, isRead: !msg.isRead } : msg
    ));
  };

  const handleSaveChanges = () => {
    // 相手の名前を全メッセージに反映
    const updatedMessages = editingMessages.map(msg => 
      !msg.isUser ? { ...msg, userName: otherUserName } : msg
    );
    
    // ユーザーデータも同時に保存
    const updatedUserData = {
      otherUserName: otherUserName,
      otherAvatarSettings: otherAvatarSettings,
      userAvatarSettings: userAvatarSettings
    };
    
    console.log('Saving user data:', updatedUserData); // デバッグ用
    onUpdateMessages(updatedMessages, updatedUserData);
    alert('変更を保存しました！');
  };

  const handleNameChange = (newName: string) => {
    setOtherUserName(newName);
    // 既存の相手のメッセージの名前も更新
    setEditingMessages(editingMessages.map(msg => 
      !msg.isUser ? { ...msg, userName: newName } : msg
    ));
    setShowNameEditor(false);
  };

  // メッセージのグループ化判定
  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    
    const currentMessage = editingMessages[currentIndex];
    const prevMessage = editingMessages[currentIndex - 1];
    
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
    
    const currentMessage = editingMessages[currentIndex];
    const prevMessage = editingMessages[currentIndex - 1];
    
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
      {/* Header */}
      <div className="bg-[#8cabd8]/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 text-black hover:text-gray-600"
          >
            <IoChevronBack size={24} />
          </button>
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
            <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white text-lg">
              ⚙️
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black">トーク管理</h2>
            <button
              onClick={() => setShowNameEditor(true)}
              className="text-sm text-gray-700 hover:text-black underline"
            >
              相手: {otherUserName}
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenAvatarEditor('user')}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-1"
          >
            <IoImage size={14} />
            <span className="text-sm">あなた</span>
          </button>
          <button
            onClick={() => handleOpenAvatarEditor('other')}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-1"
          >
            <IoImage size={14} />
            <span className="text-sm">相手</span>
          </button>
          <button
            onClick={() => {
              // 全ての自分のメッセージを既読に
              setEditingMessages(editingMessages.map(msg => ({
                ...msg,
                isRead: msg.isUser ? true : msg.isRead
              })));
            }}
            className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-1"
          >
            <span className="text-sm">全既読</span>
          </button>
          <button
            onClick={handleSaveChanges}
            className="bg-[#06C755] text-white px-4 py-2 rounded-lg hover:bg-[#05B04B] flex items-center space-x-2"
          >
            <IoSend size={16} />
            <span>保存</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {editingMessages.map((message, index) => (
          <div key={message.id} className="mb-3 relative group">
            {editingMessageId === message.id ? (
              <div className="bg-white border border-blue-300 rounded-lg p-3 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleToggleMessageType(message.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      message.isUser
                        ? 'bg-[#06C755] text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {message.isUser ? 'あなた' : '相手'}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-[#06C755] text-white px-3 py-1 rounded text-xs hover:bg-[#05B04B]"
                    >
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    rows={3}
                    placeholder="メッセージを入力..."
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日時
                    </label>
                    <input
                      type="datetime-local"
                      value={editingTimestamp}
                      onChange={(e) => setEditingTimestamp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div 
                  onClick={() => handleStartEdit(message.id, message.text, message.timestamp)}
                  className="cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  <MessageBubble 
                    message={message} 
                    showAvatar={shouldShowAvatar(index)}
                    showTail={shouldShowTail(index)}
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleToggleMessageType(message.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        message.isUser
                          ? 'bg-[#06C755] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {message.isUser ? 'あなた' : '相手'}
                    </button>
                    {message.isUser && (
                      <button
                        onClick={() => handleToggleReadStatus(message.id)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          message.isRead
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {message.isRead ? '既読' : '未読'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      <IoTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Add Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setNewMessageIsUser(!newMessageIsUser)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              newMessageIsUser 
                ? 'bg-[#06C755] text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {newMessageIsUser ? 'あなた' : '相手'}として追加
          </button>
          
          <button
            onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
          >
            {showAdvancedAdd ? '簡単入力' : '詳細設定'}
          </button>
        </div>

        {showAdvancedAdd && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日時（空白の場合は現在時刻）
            </label>
            <input
              type="datetime-local"
              value={newMessageTimestamp}
              onChange={(e) => setNewMessageTimestamp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
            />
          </div>
        )}

        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
            rows={showAdvancedAdd ? 2 : 1}
            placeholder="新しいメッセージを入力..."
            style={{ 
              minHeight: '40px', 
              maxHeight: '120px',
              lineHeight: '1.5'
            }}
          />
          <button
            onClick={handleAddMessage}
            className={`flex-shrink-0 p-2 rounded-full ${
              newMessage.trim()
                ? 'bg-[#06C755] text-white hover:bg-[#05B04B]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!newMessage.trim()}
          >
            <IoAdd size={20} />
          </button>
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {showAvatarEditor && editingAvatarFor && (
        <AvatarEditor
          currentSettings={editingAvatarFor === 'user' ? userAvatarSettings : otherAvatarSettings}
          userName={editingAvatarFor === 'user' ? 'あなた' : otherUserName}
          onSave={handleSaveAvatarSettings}
          onClose={() => {
            setShowAvatarEditor(false);
            setEditingAvatarFor(null);
          }}
        />
      )}

      {/* Name Editor Modal */}
      {showNameEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">相手の名前を変更</h3>
              <button
                onClick={() => setShowNameEditor(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前
              </label>
              <input
                type="text"
                value={otherUserName}
                onChange={(e) => setOtherUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                placeholder="相手の名前を入力"
                maxLength={20}
              />
              <div className="text-xs text-gray-500 mt-1">
                {otherUserName.length}/20文字
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNameEditor(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleNameChange(otherUserName)}
                className="flex-1 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B]"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};