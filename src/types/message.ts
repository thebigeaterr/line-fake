export interface AvatarSettings {
  url: string;
  scale: number; // 1.0 = 100%
  positionX: number; // 0-100%
  positionY: number; // 0-100%
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  avatar?: string;
  avatarSettings?: AvatarSettings;
  userName?: string;
  isRead?: boolean; // 既読状態
  userId?: string; // ユーザーを識別するID
  imageUrl?: string; // 画像メッセージのURL
  isStamp?: boolean; // スタンプかどうか
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  avatarSettings?: AvatarSettings | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  avatarSettings?: AvatarSettings;
  messages: Message[];
  participants?: User[]; // グループチャットの参加者
  isGroup?: boolean; // グループチャットかどうか
}