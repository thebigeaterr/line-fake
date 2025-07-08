import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

const KV_KEY = 'line-fake-chat-rooms';

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

// ローカル開発用のファイルストレージ
async function getLocalData() {
  const dataDir = path.join(process.cwd(), 'data');
  const dataFile = path.join(dataDir, 'chat-rooms.json');
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  try {
    const data = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(data);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

async function saveLocalData(data: unknown) {
  const dataDir = path.join(process.cwd(), 'data');
  const dataFile = path.join(dataDir, 'chat-rooms.json');
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

// GET: データを読み込み
export async function GET() {
  try {
    // Vercel KVが利用可能な場合
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const data = await kv.get(KV_KEY);
        if (data) {
          return NextResponse.json(data);
        }
        // KVにデータがない場合はデフォルトデータを設定
        await kv.set(KV_KEY, defaultData);
        return NextResponse.json(defaultData);
      } catch (kvError) {
        console.error('KV read error:', kvError);
        // KVエラーの場合はフォールバック
      }
    }
    
    // ローカル開発環境の場合
    const data = await getLocalData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to read chat data:', err);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST: データを保存
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Vercel KVが利用可能な場合
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        await kv.set(KV_KEY, data);
        return NextResponse.json({ success: true });
      } catch (kvError) {
        console.error('KV write error:', kvError);
        // KVエラーの場合はフォールバック
      }
    }
    
    // ローカル開発環境の場合
    await saveLocalData(data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to save chat data:', err);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}