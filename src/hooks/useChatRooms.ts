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
  const [chatRooms, setChatRooms] = useState<ChatRoomData[]>([defaultChatRoom]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // サーバーからデータを読み込む
  const loadDataFromServer = async () => {
    try {
      const response = await fetch('/api/chat-data');
      if (response.ok) {
        const data = await response.json();
        // 日付を復元
        const restoredData = data.map((room: any) => ({
          ...room,
          lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : undefined,
          messages: room.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatRooms(restoredData);
      }
    } catch (error) {
      console.error('Failed to load chat data from server:', error);
      // フォールバックとしてlocalStorageを使用
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const restoredData = parsedData.map((room: any) => ({
            ...room,
            lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : undefined,
            messages: room.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChatRooms(restoredData);
        } catch (error) {
          console.error('Failed to parse saved chat rooms:', error);
        }
      }
    }
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
    try {
      const response = await fetch('/api/chat-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });

      if (response.ok) {
        setChatRooms(rooms);
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
        setChatRooms(rooms);
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
    saveChatRooms(updatedRooms);
    return newRoom.id;
  };

  // チャットルームを削除
  const deleteChatRoom = (roomId: string) => {
    const updatedRooms = chatRooms.filter(room => room.id !== roomId);
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
            room.participants[0]?.avatarSettings : 
            room.participants[1]?.avatarSettings,
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
    
    saveChatRooms(updatedRooms);
  };

  // チャットルームを更新（管理画面から）
  const updateChatRoom = (roomId: string, messages: Message[], userData?: any) => {
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        const lastMsg = messages[messages.length - 1];
        const updatedRoom = {
          ...room,
          messages,
          lastMessage: lastMsg?.text,
          lastMessageTime: lastMsg?.timestamp,
          name: userData?.isGroup && userData?.participants ? 
            `グループ (${userData.participants.length}人)` : 
            userData?.otherUserName || room.name,
          isGroup: userData?.isGroup || false,
          participants: userData?.participants || room.participants
        };
        
        // ユーザーデータがある場合は参加者情報を更新
        if (userData) {
          if (userData.participants) {
            updatedRoom.participants = userData.participants;
          }
          if (!userData.isGroup && userData.otherUserName) {
            // 1対1チャットの場合、2人目の参加者の名前を更新
            if (updatedRoom.participants[1]) {
              updatedRoom.participants[1].name = userData.otherUserName;
            }
          }
          
          // アバター設定を更新
          if (userData.otherAvatarSettings !== undefined && updatedRoom.participants[1]) {
            updatedRoom.participants[1].avatarSettings = userData.otherAvatarSettings;
          }
          if (userData.userAvatarSettings !== undefined && updatedRoom.participants[0]) {
            updatedRoom.participants[0].avatarSettings = userData.userAvatarSettings;
          }
        }
        
        return updatedRoom;
      }
      return room;
    });
    
    saveChatRooms(updatedRooms);
  };

  // 未読数をリセット
  const resetUnreadCount = (roomId: string) => {
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        return { ...room, unreadCount: 0 };
      }
      return room;
    });
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
    clearAllData
  };
};