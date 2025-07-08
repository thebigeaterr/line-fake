import { useState, useEffect } from 'react';
import { Message, AvatarSettings } from '@/types/message';
import { ChatRoomData } from '@/components/ChatRoomList';

const STORAGE_KEY = 'line-fake-chatrooms';

const defaultChatRoom: ChatRoomData = {
  id: 'room1',
  name: 'サンプルユーザー',
  lastMessage: 'はい、元気です！今日はいい天気ですね。',
  lastMessageTime: new Date(),
  unreadCount: 0,
  isGroup: false,
  participants: [
    { id: 'user1', name: 'あなた', avatarSettings: null },
    { id: 'user2', name: 'サンプルユーザー', avatarSettings: null }
  ],
  messages: [
    {
      id: '1',
      text: 'こんにちは！',
      isUser: false,
      timestamp: new Date(Date.now() - 30000),
      userName: 'サンプルユーザー'
    },
    {
      id: '2',
      text: 'こんにちは！元気ですか？',
      isUser: true,
      timestamp: new Date(Date.now() - 20000),
      userName: 'あなた',
      isRead: true
    },
    {
      id: '3',
      text: 'はい、元気です！今日はいい天気ですね。',
      isUser: false,
      timestamp: new Date(Date.now() - 10000),
      userName: 'サンプルユーザー'
    }
  ]
};

export const useChatRooms = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomData[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // サーバーからデータを読み込む
  const loadDataFromServer = async () => {
    try {
      const response = await fetch('/api/chat-data');
      if (response.ok) {
        const data = await response.json();
        // 日付を復元
        const restoredData = data.map((room: Record<string, unknown>) => ({
          ...room,
          lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime as string) : undefined,
          messages: (room.messages as Record<string, unknown>[]).map((msg: Record<string, unknown>) => ({
            ...msg,
            timestamp: new Date(msg.timestamp as string)
          }))
        }));
        setChatRooms(restoredData);
      } else {
        // サーバーからデータが取得できなかった場合はデフォルトデータを使用
        setChatRooms([defaultChatRoom]);
      }
    } catch (error) {
      console.error('Failed to load chat data from server:', error);
      // フォールバックとしてlocalStorageを使用
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const restoredData = parsedData.map((room: Record<string, unknown>) => ({
            ...room,
            lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime as string) : undefined,
            messages: (room.messages as Record<string, unknown>[]).map((msg: Record<string, unknown>) => ({
              ...msg,
              timestamp: new Date(msg.timestamp as string)
            }))
          }));
          setChatRooms(restoredData);
        } catch (error) {
          console.error('Failed to parse saved chat rooms:', error);
          setChatRooms([defaultChatRoom]);
        }
      } else {
        // ローカルストレージにもデータがない場合
        setChatRooms([defaultChatRoom]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDataFromServer();
  }, []);

  // 自動保存: 2分ごとに定期保存
  useEffect(() => {
    const interval = setInterval(() => {
      if (chatRooms.length > 0) {
        saveChatRooms(chatRooms);
        console.log('Auto-saved chat data');
      }
    }, 120000); // 2分ごと

    return () => clearInterval(interval);
  }, [chatRooms]);

  // 自動保存: ページ離脱時に保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatRooms.length > 0) {
        // 同期的な保存（ページ離脱時）
        navigator.sendBeacon('/api/chat-data', JSON.stringify(chatRooms));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && chatRooms.length > 0) {
        saveChatRooms(chatRooms);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatRooms]);

  // データをサーバーに保存
  const saveChatRooms = async (rooms: ChatRoomData[]) => {
    console.log('saveChatRooms called with:', rooms.length, 'rooms');
    try {
      const response = await fetch('/api/chat-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });

      if (response.ok) {
        console.log('Data saved to server successfully');
        // バックアップとしてlocalStorageにも保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
      } else {
        throw new Error('Failed to save to server');
      }
    } catch (error) {
      console.error('Failed to save to server:', error);
      // フォールバックとしてlocalStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
        console.log('Saved to localStorage as fallback');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        alert('データの保存に失敗しました。');
      }
    }
  };

  // 現在のチャットルームを取得
  const getCurrentRoom = () => {
    if (!currentRoomId) return null;
    return chatRooms.find(room => room.id === currentRoomId);
  };

  // チャットルームを作成
  const createChatRoom = (name: string, isGroup: boolean = false) => {
    const newRoom: ChatRoomData = {
      id: `room${Date.now()}`,
      name,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      isGroup,
      participants: isGroup ? [
        { id: 'user1', name: 'あなた', avatarSettings: null },
        { id: 'user2', name: name, avatarSettings: null }
      ] : [
        { id: 'user1', name: 'あなた', avatarSettings: null },
        { id: 'user2', name: name, avatarSettings: null }
      ],
      messages: []
    };
    
    const updatedRooms = [...chatRooms, newRoom];
    setChatRooms(updatedRooms);
    saveChatRooms(updatedRooms);
    return newRoom.id;
  };

  // チャットルームを削除
  const deleteChatRoom = (roomId: string) => {
    const updatedRooms = chatRooms.filter(room => room.id !== roomId);
    setChatRooms(updatedRooms);
    saveChatRooms(updatedRooms);
    if (currentRoomId === roomId) {
      setCurrentRoomId(null);
    }
  };

  // メッセージを追加
  const addMessage = (roomId: string, text: string, isUser: boolean = true) => {
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          isUser,
          timestamp: new Date(),
          userName: isUser ? 'あなた' : room.participants[1]?.name || 'ユーザー',
          avatarSettings: isUser ? 
            (room.participants[0]?.avatarSettings as AvatarSettings | undefined) : 
            (room.participants[1]?.avatarSettings as AvatarSettings | undefined),
          isRead: isUser ? true : undefined
        };
        
        return {
          ...room,
          messages: [...room.messages, newMessage],
          lastMessage: text,
          lastMessageTime: new Date(),
          unreadCount: isUser ? 0 : (room.unreadCount || 0) + 1
        };
      }
      return room;
    });
    
    setChatRooms(updatedRooms);
    saveChatRooms(updatedRooms);
  };

  // チャットルームを更新（管理画面から）
  const updateChatRoom = async (roomId: string, messages: Message[], userData?: Record<string, unknown>) => {
    console.log('updateChatRoom called with:', { roomId, userData });
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        const lastMsg = messages[messages.length - 1];
        const updatedRoom = {
          ...room,
          messages,
          lastMessage: lastMsg?.text,
          lastMessageTime: lastMsg?.timestamp,
          name: userData?.isGroup && userData?.participants ? 
            `グループ (${(userData.participants as unknown[]).length}人)` : 
            (userData?.otherUserName as string) || room.name,
          isGroup: (userData?.isGroup as boolean) || false,
          participants: room.participants // 一旦既存の参加者情報を保持
        };
        
        // ユーザーデータがある場合は参加者情報を更新
        if (userData) {
          // 参加者情報のコピーを作成
          const updatedParticipants = [...updatedRoom.participants];
          
          if (userData.participants) {
            updatedRoom.participants = userData.participants as Array<{id: string; name: string; avatarSettings: AvatarSettings | null}>;
          } else {
            // 個別の更新の場合
            if (!userData.isGroup && userData.otherUserName) {
              // 1対1チャットの場合、2人目の参加者の名前を更新
              if (updatedParticipants[1]) {
                updatedParticipants[1] = {
                  ...updatedParticipants[1],
                  name: userData.otherUserName as string
                };
              }
            }
            
            // アバター設定を更新
            if (userData.otherAvatarSettings !== undefined && updatedParticipants[1]) {
              updatedParticipants[1] = {
                ...updatedParticipants[1],
                avatarSettings: userData.otherAvatarSettings as AvatarSettings | null
              };
            }
            if (userData.userAvatarSettings !== undefined && updatedParticipants[0]) {
              updatedParticipants[0] = {
                ...updatedParticipants[0],
                avatarSettings: userData.userAvatarSettings as AvatarSettings | null
              };
            }
            
            updatedRoom.participants = updatedParticipants;
          }
        }
        
        return updatedRoom;
      }
      return room;
    });
    
    console.log('updateChatRoom: setting state and saving');
    // 即座に状態を更新
    setChatRooms(updatedRooms);
    // 即座に保存（awaitする）
    await saveChatRooms(updatedRooms);
  };

  // 未読数をリセット
  const resetUnreadCount = (roomId: string) => {
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        return { ...room, unreadCount: 0 };
      }
      return room;
    });
    setChatRooms(updatedRooms);
    saveChatRooms(updatedRooms);
  };

  // localStorageをクリア
  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setChatRooms([defaultChatRoom]);
      setCurrentRoomId(null);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  return {
    chatRooms,
    currentRoomId,
    setCurrentRoomId,
    getCurrentRoom,
    createChatRoom,
    deleteChatRoom,
    addMessage,
    updateChatRoom,
    resetUnreadCount,
    clearAllData,
    isLoading
  };
};