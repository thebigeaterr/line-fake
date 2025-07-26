import { useState, useEffect } from 'react';
import { Message, AvatarSettings } from '@/types/message';
import { ChatRoomData } from '@/components/ChatRoomList';
import { DataProtectionBackup } from '@/utils/backup';

const STORAGE_KEY = 'line-fake-chatrooms';

// 危険なdefaultChatRoomを削除 - ユーザーデータを上書きする原因だった

export const useChatRooms = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomData[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState<number>(0);
  // const [lastSaveTimestamp, setLastSaveTimestamp] = useState<number>(Date.now());
  const [isEditing, setIsEditing] = useState(false);

  // サーバーからデータを読み込む
  const loadDataFromServer = async () => {
    try {
      setError(null); // エラー状態をクリア
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
        setDataVersion(Date.now()); // データ更新時にバージョンを更新
        console.log('Data loaded from server successfully');
      } else {
        // サーバーからデータが取得できなかった場合
        console.error('Server returned non-OK status:', response.status);
        setError(`サーバーエラー: ${response.status}`);
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load chat data from server:', error);
      setError('サーバーとの通信に失敗しました');
      
      // サーバーエラー時はlocalStorageからのみ復元を試行
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
          setError('オフラインデータを使用しています');
          console.log('Data restored from localStorage');
        } catch (parseError) {
          console.error('Failed to parse saved chat rooms:', parseError);
          setError('データの復元に失敗しました');
          console.warn('Keeping empty state - no default data will be inserted');
        }
      } else {
        // localStorageにもデータがない場合、空の状態を維持
        console.warn('No saved data found - keeping empty state');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDataFromServer();
    
    // 緊急対策: 30秒同期を無効化 - データ後退の原因の可能性
    // const syncInterval = setInterval(async () => {
    //   console.log('Auto-sync temporarily disabled to prevent data loss');
    // }, 30000);

    // return () => clearInterval(syncInterval); // 同期無効化中
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // 自動保存: 2分ごとに定期保存
  useEffect(() => {
    const interval = setInterval(() => {
      if (chatRooms.length > 0 && !isEditing) {
        saveChatRooms(chatRooms, true); // 自動保存では競合チェックをスキップ
        console.log('Auto-saved chat data');
      }
    }, 120000); // 2分ごと

    return () => clearInterval(interval);
  }, [chatRooms, isEditing]);

  // 修正: ページ離脱時の保存で古い状態が保存される問題を防ぐ
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 関数型更新で最新の状態を取得
      setChatRooms(currentRooms => {
        if (currentRooms.length > 0) {
          console.log('Saving current rooms on page unload:', currentRooms.length);
          navigator.sendBeacon('/api/chat-data', JSON.stringify(currentRooms));
        }
        return currentRooms; // 状態は変更しない
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 関数型更新で最新の状態を取得
        setChatRooms(currentRooms => {
          if (currentRooms.length > 0) {
            console.log('Saving current rooms on visibility change:', currentRooms.length);
            saveChatRooms(currentRooms, true); // 競合チェックをスキップ
          }
          return currentRooms; // 状態は変更しない
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // 依存配列を空にしてクロージャー問題を防ぐ

  // データをサーバーに保存（競合検知付き）
  const saveChatRooms = async (rooms: ChatRoomData[], skipConflictCheck: boolean = false) => {
    console.log('saveChatRooms called with:', rooms.length, 'rooms');
    console.log('Saving room data:', JSON.stringify(rooms[0], null, 2));
    
    // 競合検知（保存前にサーバーデータを確認）
    if (!skipConflictCheck) {
      try {
        const response = await fetch('/api/chat-data');
        if (response.ok) {
          const serverData = await response.json();
          if (serverData && Array.isArray(serverData)) {
            const currentDataString = JSON.stringify(chatRooms);
            const serverDataString = JSON.stringify(serverData);
            
            if (currentDataString !== serverDataString) {
              console.warn('Data conflict detected - server data has changed');
              
              // 競合解決のオプションを提供
              const userChoice = confirm(
                '他の端末でデータが変更されています。\n\n' +
                '「OK」: 現在の変更を保存（他の変更を上書き）\n' +
                '「キャンセル」: 保存を中止してデータを再読み込み'
              );
              
              if (!userChoice) {
                // ユーザーが保存をキャンセルした場合
                await loadDataFromServer();
                throw new Error('Save cancelled due to data conflict');
              }
            }
          }
        }
      } catch (error) {
        console.error('Conflict check failed:', error);
        // 競合チェックに失敗した場合も保存は続行
      }
    }
    
    // 保存前に緊急バックアップを作成
    try {
      await DataProtectionBackup.createBackup(rooms);
      console.log('Emergency backup created before save');
    } catch (backupError) {
      console.error('Emergency backup failed:', backupError);
      // バックアップが失敗しても保存は続行
    }
    
    try {
      const response = await fetch('/api/chat-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });

      if (response.ok) {
        await response.json();
        const saveTimestamp = Date.now();
        console.log('Data saved to server successfully at:', new Date(saveTimestamp).toISOString());
        
        // タイムスタンプ付きでlocalStorageに保存
        const dataWithTimestamp = {
          data: rooms,
          timestamp: saveTimestamp,
          version: dataVersion
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
        setDataVersion(saveTimestamp);
        // setLastSaveTimestamp(saveTimestamp);
      } else {
        const errorText = await response.text();
        console.error('Server save failed:', response.status, errorText);
        throw new Error(`Failed to save to server: ${response.status}`);
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
    saveChatRooms(updatedRooms, true); // 作成操作では競合チェックをスキップ
    return newRoom.id;
  };

  // チャットルームを削除
  const deleteChatRoom = (roomId: string) => {
    const updatedRooms = chatRooms.filter(room => room.id !== roomId);
    setChatRooms(updatedRooms);
    saveChatRooms(updatedRooms, true); // 削除操作では競合チェックをスキップ
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
    saveChatRooms(updatedRooms, true); // メッセージ追加では競合チェックをスキップ
  };

  // チャットルームを更新（管理画面から）
  const updateChatRoom = async (roomId: string, messages: Message[], userData?: Record<string, unknown>) => {
    console.log('updateChatRoom called with:', { roomId, userData });
    setIsEditing(true); // 編集開始
    
    const updatedRooms = chatRooms.map(room => {
      if (room.id === roomId) {
        const lastMsg = messages[messages.length - 1];
        const updatedRoom = {
          ...room,
          messages,
          lastMessage: lastMsg?.text,
          lastMessageTime: new Date(), // 編集時は現在時刻を使用
          name: userData?.isGroup && userData?.participants ? 
            `グループ (${(userData.participants as unknown[]).length}人)` : 
            (userData?.otherUserName as string) || room.name,
          isGroup: (userData?.isGroup as boolean) || false,
          participants: room.participants // 一旦既存の参加者情報を保持
        };
        
        // ユーザーデータがある場合は参加者情報を更新
        if (userData) {
          console.log('Updating participants with userData:', userData);
          // 参加者情報のコピーを作成
          let updatedParticipants = [...updatedRoom.participants];
          console.log('Current participants:', updatedParticipants);
          
          // まず個別のアバター設定と名前を更新
          if (!userData.isGroup && userData.otherUserName) {
            // 1対1チャットの場合、2人目の参加者の名前を更新
            if (updatedParticipants[1]) {
              updatedParticipants[1] = {
                ...updatedParticipants[1],
                name: userData.otherUserName as string
              };
              console.log('Updated participant[1] name:', updatedParticipants[1]);
            }
          }
          
          // アバター設定を更新
          if (userData.otherAvatarSettings !== undefined && updatedParticipants[1]) {
            updatedParticipants[1] = {
              ...updatedParticipants[1],
              avatarSettings: userData.otherAvatarSettings as AvatarSettings | null
            };
            console.log('Updated participant[1] avatar:', updatedParticipants[1]);
          }
          if (userData.userAvatarSettings !== undefined && updatedParticipants[0]) {
            updatedParticipants[0] = {
              ...updatedParticipants[0],
              avatarSettings: userData.userAvatarSettings as AvatarSettings | null
            };
            console.log('Updated participant[0] avatar:', updatedParticipants[0]);
          }
          
          // 最後に完全なparticipants配列で上書きする場合のみ置き換え
          if (userData.participants) {
            updatedParticipants = userData.participants as Array<{id: string; name: string; avatarSettings: AvatarSettings | null}>;
            console.log('Overridden with userData.participants:', updatedParticipants);
          }
          
          updatedRoom.participants = updatedParticipants;
          
          console.log('Final updated participants:', updatedRoom.participants);
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
    setIsEditing(false); // 編集終了
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
    saveChatRooms(updatedRooms, true); // 未読数リセットでは競合チェックをスキップ
  };

  // localStorageをクリア
  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setChatRooms([]); // 空の状態に設定（デフォルトデータは挿入しない）
      setCurrentRoomId(null);
      console.log('All data cleared - empty state set');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  // 手動でサーバーからデータを再読み込み
  const reloadFromServer = async () => {
    console.log('Manual reload triggered');
    setIsLoading(true);
    await loadDataFromServer();
  };

  // 緊急バックアップからデータを復元
  const restoreFromEmergencyBackup = async () => {
    try {
      const allBackups = await DataProtectionBackup.getAllBackups();
      if (allBackups.length > 0) {
        const latestBackup = allBackups[0];
        console.log('Restoring from emergency backup:', latestBackup.timestamp);
        
        // 復元前に現在のデータをバックアップ
        await DataProtectionBackup.createBackup(chatRooms);
        
        // 復元実行
        setChatRooms(latestBackup.data as ChatRoomData[]);
        await saveChatRooms(latestBackup.data as ChatRoomData[]);
        
        console.log('Emergency backup restored successfully');
        return true;
      } else {
        console.log('No emergency backups found');
        return false;
      }
    } catch (error) {
      console.error('Failed to restore from emergency backup:', error);
      return false;
    }
  };

  // 全てのバックアップを取得
  const getAllBackups = async () => {
    try {
      return await DataProtectionBackup.getAllBackups();
    } catch (error) {
      console.error('Failed to get all backups:', error);
      return [];
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
    isLoading,
    error,
    dataVersion,
    isEditing,
    setIsEditing,
    reloadFromServer,
    restoreFromEmergencyBackup,
    getAllBackups
  };
};