import React, { useState, useEffect, useRef } from 'react';
import { IoAdd, IoTrash, IoImage, IoClose, IoChevronBack } from 'react-icons/io5';
import { Message, AvatarSettings } from '@/types/message';
import { MessageBubble } from './MessageBubble';
import { AvatarEditor } from './AvatarEditor';

interface AdminPanelProps {
  messages: Message[];
  onUpdateMessages: (messages: Message[], userData?: Record<string, unknown>) => Promise<void>;
  onBack: () => void;
  initialUserData?: Record<string, unknown>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  messages,
  onUpdateMessages,
  onBack,
  initialUserData
}) => {
  const [editingMessages, setEditingMessages] = useState<Message[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTimestamp, setEditingTimestamp] = useState('');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [editingAvatarFor, setEditingAvatarFor] = useState<'user' | 'other' | null>(null);
  const [userAvatarSettings, setUserAvatarSettings] = useState<AvatarSettings | null>(null);
  const [otherAvatarSettings, setOtherAvatarSettings] = useState<AvatarSettings | null>(null);
  const [otherUserName, setOtherUserName] = useState('サンプルユーザー');
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [participants, setParticipants] = useState<Array<{id: string; name: string; avatarSettings: AvatarSettings | null}>>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [showParticipantEditor, setShowParticipantEditor] = useState(false);
  // const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // editingMessagesが空の場合のみ初期化
    if (editingMessages.length === 0) {
      // 既存のメッセージで自分のメッセージに既読状態がない場合は既読に設定
      const messagesWithReadStatus = messages.map(msg => ({
        ...msg,
        isRead: msg.isUser && msg.isRead === undefined ? true : msg.isRead
      }));
      setEditingMessages(messagesWithReadStatus);
    }
    
    // 初期ユーザーデータから設定を読み込み（優先）
    if (initialUserData) {
      // 相手の名前を設定
      if (initialUserData.otherUserName) {
        setOtherUserName(initialUserData.otherUserName as string);
      }
      // 相手のアバター設定を設定
      if (initialUserData.otherAvatarSettings) {
        setOtherAvatarSettings(initialUserData.otherAvatarSettings as AvatarSettings);
      }
      // 自分のアバター設定を設定
      if (initialUserData.userAvatarSettings) {
        setUserAvatarSettings(initialUserData.userAvatarSettings as AvatarSettings);
      }
      // 参加者情報を設定
      if (initialUserData.participants) {
        setParticipants(initialUserData.participants as Array<{id: string; name: string; avatarSettings: AvatarSettings | null}>);
      }
      // グループチャット判定を設定
      if (initialUserData.isGroup !== undefined) {
        setIsGroupChat(initialUserData.isGroup as boolean);
      }
    }
    
    // メッセージから現在のユーザーデータを抽出（初期値が無い場合のフォールバック）
    const firstOtherMessage = messages.find(msg => !msg.isUser);
    if (firstOtherMessage) {
      if (firstOtherMessage.userName && !initialUserData?.otherUserName) {
        setOtherUserName(firstOtherMessage.userName);
      }
      if (firstOtherMessage.avatarSettings && !initialUserData?.otherAvatarSettings) {
        setOtherAvatarSettings(firstOtherMessage.avatarSettings);
      }
    }
    
    // あなたのメッセージからアバター設定を抽出（初期値が無い場合のフォールバック）
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (firstUserMessage && firstUserMessage.avatarSettings && !initialUserData?.userAvatarSettings) {
      setUserAvatarSettings(firstUserMessage.avatarSettings);
    }
  }, [messages, initialUserData, editingMessages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // AdminPanelは少し長めの遅延
    
    return () => clearTimeout(timer);
  }, [editingMessages]);

  // 変更を追跡する関数
  const markAsChanged = () => {
    if (!hasChanges) {
      setHasChanges(true);
    }
  };

  // 共通の保存関数（即座には親に反映しない）
  const saveChangesLocally = (updatedMessages: Message[]) => {
    setEditingMessages(updatedMessages);
    markAsChanged();
  };

  // 親コンポーネントに変更を反映する関数
  const saveChangesToParent = async () => {
    // グループチャットでない場合は、相手の名前を全メッセージに反映
    const finalMessages = isGroupChat ? editingMessages : editingMessages.map(msg => 
      !msg.isUser ? { ...msg, userName: otherUserName } : msg
    );
    
    // ユーザーデータも同時に保存
    const updatedUserData: Record<string, unknown> = {
      otherUserName: otherUserName,
      otherAvatarSettings: otherAvatarSettings,
      userAvatarSettings: userAvatarSettings,
      // participants配列を送信せず、個別のアバター設定を優先
      isGroup: isGroupChat
    };
    
    await onUpdateMessages(finalMessages, updatedUserData);
    setHasChanges(false);
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setShowSaveConfirm(true);
    } else {
      onBack();
    }
  };

  const handleSaveAndBack = async () => {
    await saveChangesToParent();
    setShowSaveConfirm(false);
    onBack();
  };

  const handleDiscardAndBack = () => {
    setShowSaveConfirm(false);
    setHasChanges(false);
    onBack();
  };

  const handleInsertMessage = (afterIndex: number) => {
    const timestamp = new Date();
    const message: Message = {
      id: Date.now().toString(),
      text: '新しいメッセージ',
      isUser: true,
      timestamp: timestamp,
      userName: 'あなた',
      avatarSettings: userAvatarSettings || undefined,
      isRead: true,
      userId: 'user1'
    };
    
    const newMessages = [...editingMessages];
    // -1の場合は最初に挿入、それ以外は指定されたインデックスの後に挿入
    const insertIndex = afterIndex === -1 ? 0 : afterIndex + 1;
    newMessages.splice(insertIndex, 0, message);
    
    // ローカルに保存
    saveChangesLocally(newMessages);
    
    // 新規追加されたメッセージを編集モードにする
    setTimeout(() => {
      setEditingMessageId(message.id);
      setEditingText(message.text);
      setEditingTimestamp(formatDateTimeForInput(message.timestamp));
    }, 100);
  };

  const handleOpenAvatarEditor = (forUser: 'user' | 'other') => {
    setEditingAvatarFor(forUser);
    setShowAvatarEditor(true);
  };

  const handleSaveAvatarSettings = async (settings: AvatarSettings | null) => {
    let updatedMessages = editingMessages;
    
    if (editingAvatarFor === 'user') {
      setUserAvatarSettings(settings);
      // 既存の自分のメッセージにも適用
      updatedMessages = editingMessages.map(msg => 
        msg.isUser ? { ...msg, avatarSettings: settings || undefined } : msg
      );
      saveChangesLocally(updatedMessages);
    } else if (editingAvatarFor === 'other') {
      setOtherAvatarSettings(settings);
      // 既存の相手のメッセージにも適用
      updatedMessages = editingMessages.map(msg => 
        !msg.isUser ? { ...msg, avatarSettings: settings || undefined, userName: otherUserName } : msg
      );
      saveChangesLocally(updatedMessages);
    }
    
    // アバター設定を即座に保存
    await saveChangesToParent();
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
      const updatedMessages = editingMessages.map(msg => 
        msg.id === editingMessageId ? { 
          ...msg, 
          text: editingText,
          timestamp: newTimestamp
        } : msg
      );
      saveChangesLocally(updatedMessages);
      setEditingMessageId(null);
      setEditingText('');
      setEditingTimestamp('');
      
      saveChangesLocally(updatedMessages);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
    setEditingTimestamp('');
  };

  const handleDeleteMessage = (id: string) => {
    const updatedMessages = editingMessages.filter(msg => msg.id !== id);
    saveChangesLocally(updatedMessages);
  };

  const handleToggleMessageType = (id: string) => {
    const updatedMessages = editingMessages.map(msg => {
      if (msg.id === id) {
        const newIsUser = !msg.isUser;
        return {
          ...msg, 
          isUser: newIsUser,
          isRead: newIsUser ? true : undefined, // ユーザーメッセージに変更時は既読にリセット
          userName: newIsUser ? 'あなた' : otherUserName,
          avatarSettings: newIsUser ? (userAvatarSettings || undefined) : (otherAvatarSettings || undefined),
          userId: newIsUser ? 'user1' : 'user2'
        };
      }
      return msg;
    });
    saveChangesLocally(updatedMessages);
  };

  const handleToggleReadStatus = (id: string) => {
    const updatedMessages = editingMessages.map(msg => 
      msg.id === id && msg.isUser ? { ...msg, isRead: !msg.isRead } : msg
    );
    saveChangesLocally(updatedMessages);
  };


  const handleNameChange = (newName: string) => {
    setOtherUserName(newName);
    markAsChanged();
    // 既存の相手のメッセージの名前も更新
    const updatedMessages = editingMessages.map(msg => 
      !msg.isUser ? { ...msg, userName: newName } : msg
    );
    saveChangesLocally(updatedMessages);
    setShowNameEditor(false);
    
    saveChangesLocally(updatedMessages);
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
            onClick={handleBackClick}
            className="p-1 text-black hover:text-gray-600"
          >
            <IoChevronBack size={24} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isGroupChat && (
            <button
              onClick={() => setShowNameEditor(true)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-1 text-sm"
            >
              <IoImage size={14} />
              <span>相手設定</span>
            </button>
          )}
          <button
            onClick={() => {
              // 全ての自分のメッセージを既読に
              const updatedMessages = editingMessages.map(msg => ({
                ...msg,
                isRead: msg.isUser ? true : msg.isRead
              }));
              saveChangesLocally(updatedMessages);
            }}
            className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-1 text-sm"
          >
            <span>全既読</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 最初のメッセージの前に挿入ボタン */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => handleInsertMessage(-1)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors opacity-60 hover:opacity-100"
          >
            <IoAdd size={16} />
          </button>
        </div>
        
        {editingMessages.map((message, index) => (
          <div key={message.id}>
            <div className="mb-3 relative group">
            {editingMessageId === message.id ? (
              <div className="bg-white border border-blue-300 rounded-lg p-3 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex bg-gray-200 rounded-full p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (message.isUser) {
                          handleToggleMessageType(message.id);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        !message.isUser 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      相手
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!message.isUser) {
                          handleToggleMessageType(message.id);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        message.isUser 
                          ? 'bg-[#06C755] text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      あなた
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleDeleteMessage(message.id);
                        setEditingMessageId(null);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      削除
                    </button>
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
                
                {/* 既読設定（自分のメッセージの場合のみ表示） */}
                {message.isUser && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      既読状態
                    </label>
                    <div className="flex bg-gray-200 rounded-full p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (message.isRead) {
                            handleToggleReadStatus(message.id);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          !message.isRead 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        未読
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!message.isRead) {
                            handleToggleReadStatus(message.id);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          message.isRead 
                            ? 'bg-blue-500 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        既読
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    rows={3}
                    placeholder="メッセージを入力..."
                  />
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`image-upload-${message.id}`} className="cursor-pointer">
                      <div className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <IoImage size={20} />
                        <span className="text-sm">画像を追加</span>
                      </div>
                      <input
                        id={`image-upload-${message.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              // 動的インポートで圧縮ユーティリティを読み込み
                              const { processImageFile } = await import('@/utils/imageCompression');
                              
                              // 画像を自動圧縮（5MB以下にする）
                              const processedFile = await processImageFile(file, 5);
                              
                              const formData = new FormData();
                              formData.append('file', processedFile);
                              
                              const response = await fetch('/api/upload-image', {
                                method: 'POST',
                                body: formData
                              });
                              
                              if (response.ok) {
                                const { url } = await response.json();
                                const updatedMessage = {
                                  ...message,
                                  imageUrl: url,
                                  text: editingText || ' ' // 画像のみの場合は空白文字を設定
                                };
                                const newMessages = [...editingMessages];
                                newMessages[index] = updatedMessage;
                                saveChangesLocally(newMessages);
                                setEditingMessageId(null);
                              } else {
                                const errorData = await response.json();
                                if (errorData.error === 'File size must be less than 10MB') {
                                  alert('ファイルサイズが10MBを超えています。画像を圧縮できませんでした。');
                                } else if (errorData.error === 'Only image files are allowed') {
                                  alert('画像ファイルのみアップロード可能です。');
                                } else {
                                  alert(`アップロードに失敗しました: ${errorData.error}`);
                                }
                              }
                            } catch (error) {
                              console.error('Upload failed:', error);
                              alert('画像のアップロードに失敗しました');
                            }
                          }
                        }}
                      />
                    </label>
                    {message.imageUrl && (
                      <button
                        onClick={() => {
                          const updatedMessage = { ...message };
                          delete updatedMessage.imageUrl;
                          const newMessages = [...editingMessages];
                          newMessages[index] = updatedMessage;
                          saveChangesLocally(newMessages);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        画像を削除
                      </button>
                    )}
                  </div>
                  
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
                    isGroupChat={isGroupChat}
                  />
                </div>
                {message.imageUrl && (
                  <div className="text-xs text-gray-500 ml-2 mt-1">
                    画像付きメッセージ
                  </div>
                )}
              </div>
            )}
            </div>
            
            {/* 各メッセージの後に挿入ボタン */}
            <div className="flex justify-center my-2">
              <button
                onClick={() => handleInsertMessage(index)}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors opacity-60 hover:opacity-100"
              >
                <IoAdd size={16} />
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>


      {/* Avatar Editor Modal */}
      {showAvatarEditor && editingAvatarFor && (
        <AvatarEditor
          currentSettings={editingAvatarFor === 'user' ? (userAvatarSettings || undefined) : (otherAvatarSettings || undefined)}
          userName={editingAvatarFor === 'user' ? 'あなた' : otherUserName}
          onSave={handleSaveAvatarSettings}
          onClose={() => {
            setShowAvatarEditor(false);
            setEditingAvatarFor(null);
          }}
        />
      )}

      {/* Other User Settings Modal */}
      {showNameEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">相手の設定</h3>
              <button
                onClick={() => setShowNameEditor(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Setting */}
              <div>
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

              {/* Avatar Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン画像
                </label>
                <button
                  onClick={() => {
                    setShowNameEditor(false);
                    handleOpenAvatarEditor('other');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                >
                  <IoImage size={20} />
                  <span>アイコン画像を設定</span>
                </button>
                {otherAvatarSettings?.url && (
                  <div className="mt-2 text-xs text-gray-500">
                    画像が設定されています
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
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

      {/* Participant Editor Modal */}
      {showParticipantEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">参加者管理</h3>
              <button
                onClick={() => setShowParticipantEditor(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={participant.name}
                      onChange={(e) => {
                        const newParticipants = [...participants];
                        newParticipants[index].name = e.target.value;
                        setParticipants(newParticipants);
                      }}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="名前を入力"
                    />
                  </div>
                  {participants.length > 2 && (
                    <button
                      onClick={() => {
                        setParticipants(participants.filter(p => p.id !== participant.id));
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                    >
                      <IoTrash size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newId = `user${Date.now()}`;
                  setParticipants([...participants, {
                    id: newId,
                    name: `ユーザー${participants.length + 1}`,
                    avatarSettings: null
                  }]);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
              >
                <IoAdd size={20} className="mr-1" />
                参加者を追加
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowParticipantEditor(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => setShowParticipantEditor(false)}
                className="flex-1 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B]"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">変更を保存しますか？</h3>
            <p className="text-gray-600 mb-6">
              編集内容を保存してからトーク画面に戻ります。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDiscardAndBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                いいえ
              </button>
              <button
                onClick={handleSaveAndBack}
                className="flex-1 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B]"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};