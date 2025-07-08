import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

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

// ローカル開発用のフォールバック
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
    console.log('GET request - checking Supabase connection');
    
    // Supabaseが利用可能な場合
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        console.log('Attempting to read from Supabase...');
        
        // chat_data テーブルからデータを取得
        const { data, error } = await supabase
          .from('chat_data')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (error) {
          console.log('Supabase read error:', error.message);
          
          // データが存在しない場合（初回）
          if (error.code === 'PGRST116') {
            console.log('No data found, creating default data...');
            
            // デフォルトデータを挿入
            const { error: insertError } = await supabase
              .from('chat_data')
              .insert([
                { id: 'default', data: defaultData }
              ]);
            
            if (insertError) {
              console.error('Failed to insert default data:', insertError);
              throw insertError;
            }
            
            return NextResponse.json(defaultData);
          }
          
          throw error;
        }
        
        console.log('Supabase read success');
        return NextResponse.json(data.data);
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Supabaseエラーの場合はフォールバック
      }
    }
    
    // ローカル開発環境またはSupabaseが利用できない場合
    console.log('Using local data fallback');
    const data = await getLocalData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to read chat data:', err);
    return NextResponse.json({ 
      error: 'Failed to read data', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST: データを保存
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST request - saving data');
    
    // Supabaseが利用可能な場合
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        console.log('Attempting to save to Supabase...');
        
        // データを更新（upsert）
        const { error } = await supabase
          .from('chat_data')
          .upsert([
            { id: 'default', data: data }
          ]);
        
        if (error) {
          console.error('Supabase save error:', error);
          throw error;
        }
        
        console.log('Supabase save success');
        return NextResponse.json({ success: true });
      } catch (supabaseError) {
        console.error('Supabase save error:', supabaseError);
        // Supabaseエラーの場合はフォールバック
      }
    }
    
    // ローカル開発環境またはSupabaseが利用できない場合
    console.log('Using local data fallback for save');
    await saveLocalData(data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to save chat data:', err);
    return NextResponse.json({ 
      error: 'Failed to save data', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}