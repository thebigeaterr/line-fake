import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'chat-rooms.json');

// データディレクトリを作成（存在しない場合）
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// デフォルトデータ
const defaultData = [
  {
    id: 'room1',
    name: 'サンプルユーザー',
    lastMessage: 'はい、元気です！今日はいい天気ですね。',
    lastMessageTime: new Date().toISOString(),
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
        timestamp: new Date(Date.now() - 30000).toISOString(),
        userName: 'サンプルユーザー'
      },
      {
        id: '2',
        text: 'こんにちは！元気ですか？',
        isUser: true,
        timestamp: new Date(Date.now() - 20000).toISOString(),
        userName: 'あなた',
        isRead: true
      },
      {
        id: '3',
        text: 'はい、元気です！今日はいい天気ですね。',
        isUser: false,
        timestamp: new Date(Date.now() - 10000).toISOString(),
        userName: 'サンプルユーザー'
      }
    ]
  }
];

// GET: データを読み込み
export async function GET() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch (error) {
      // ファイルが存在しない場合はデフォルトデータを作成
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return NextResponse.json(defaultData);
    }
  } catch (error) {
    console.error('Failed to read chat data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST: データを保存
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory();
    
    const data = await request.json();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save chat data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}