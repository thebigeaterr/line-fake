import { useState, useEffect } from 'react';
import { Message, AvatarSettings } from '@/types/message';

const STORAGE_KEY = 'line-fake-messages';
const USER_DATA_KEY = 'line-fake-user-data';

const defaultMessages: Message[] = [
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
];

interface UserData {
  otherUserName: string;
  otherAvatarSettings: AvatarSettings | null;
  userAvatarSettings: AvatarSettings | null;
}

const defaultUserData: UserData = {
  otherUserName: 'サンプルユーザー',
  otherAvatarSettings: null,
  userAvatarSettings: null
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  useEffect(() => {
    // メッセージデータの読み込み
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          // 既存のメッセージで自分のメッセージに既読状態がない場合は既読に設定
          isRead: msg.isUser && msg.isRead === undefined ? true : msg.isRead
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }

    // ユーザーデータの読み込み
    const savedUserData = localStorage.getItem(USER_DATA_KEY);
    console.log('Loading saved user data:', savedUserData); // デバッグ用
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        console.log('Parsed user data:', parsedUserData); // デバッグ用
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
      }
    }
  }, []);

  const saveMessages = (newMessages: Message[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    setMessages(newMessages);
  };

  const saveUserData = (newUserData: UserData) => {
    console.log('saveUserData called with:', newUserData); // デバッグ用
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
    setUserData(newUserData);
    console.log('User data saved to localStorage'); // デバッグ用
  };

  const addMessage = (text: string, isUser: boolean = true) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      userName: isUser ? 'あなた' : userData.otherUserName,
      avatarSettings: isUser ? userData.userAvatarSettings : userData.otherAvatarSettings,
      isRead: isUser ? true : undefined // 自分のメッセージは既読で開始
    };
    
    const newMessages = [...messages, newMessage];
    saveMessages(newMessages);
  };

  const updateMessages = (newMessages: Message[]) => {
    saveMessages(newMessages);
  };

  const updateUserData = (newUserData: Partial<UserData>) => {
    const updatedData = { ...userData, ...newUserData };
    saveUserData(updatedData);
  };

  const clearMessages = () => {
    saveMessages([]);
  };

  const clearAllData = () => {
    saveMessages([]);
    saveUserData(defaultUserData);
  };

  const updateAllUserMessagesToRead = () => {
    const updatedMessages = messages.map(msg => ({
      ...msg,
      isRead: msg.isUser ? true : msg.isRead
    }));
    saveMessages(updatedMessages);
  };

  return {
    messages,
    userData,
    addMessage,
    updateMessages,
    updateUserData,
    clearMessages,
    clearAllData,
    updateAllUserMessagesToRead
  };
};