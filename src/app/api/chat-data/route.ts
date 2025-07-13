import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
export async function GET(request: Request) {
  try {
    // Check if this is a debug request
    const url = new URL(request.url);
    if (url.searchParams.get('debug') === 'true') {
      return NextResponse.json({
        status: 'Debug info',
        environment: {
          SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
          KEY_VALUE: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
        }
      });
    }
    
    console.log('GET request - checking Supabase connection');
    
    // Supabaseが利用可能な場合
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Attempting to read from Supabase...');
      
      // chat_data テーブルからデータを取得
      const { data, error } = await supabase
        .from('chat_data')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) {
        console.log('Supabase read error:', error.message);
        
        // データが存在しない場合（初回のみ）
        if (error.code === 'PGRST116') {
          console.log('No data found, returning default data without saving...');
          // データベースには保存せず、デフォルトデータを返すだけ
          return NextResponse.json(defaultData);
        }
        
        return NextResponse.json({ 
          error: 'Failed to read from Supabase', 
          details: error.message 
        }, { status: 500 });
      }
      
      console.log('Supabase read success');
      return NextResponse.json(data.data);
    }
    
    // Supabaseが利用できない場合はデフォルトデータを返す
    console.log('Supabase not configured - returning default data');
    return NextResponse.json(defaultData);
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
    console.log('POST request - saving data, records:', data.length);
    
    // base64画像データを除外してURLのみを保持
    const cleanData = data.map((room: Record<string, unknown>) => ({
      ...room,
      participants: Array.isArray(room.participants) ? room.participants.map((participant: Record<string, unknown>) => ({
        ...participant,
        avatarSettings: participant.avatarSettings && typeof participant.avatarSettings === 'object' && participant.avatarSettings !== null && 'url' in participant.avatarSettings
          ? { url: (participant.avatarSettings as { url: string }).url } 
          : null
      })) : room.participants
    }));
    
    // データサイズをチェック
    const jsonString = JSON.stringify(cleanData);
    console.log('JSON size after cleaning:', jsonString.length, 'bytes');
    
    console.log('Cleaned data preview:', JSON.stringify(cleanData[0], null, 2).substring(0, 500));
    
    // Supabase環境変数チェック
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Supabaseが利用可能な場合
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Attempting to save to Supabase...');
      
      // データを更新（upsert）
      const { error, data: result } = await supabase
        .from('chat_data')
        .upsert([
          { id: 'default', data: cleanData }
        ]);
      
      if (error) {
        console.error('Supabase save error:', error);
        return NextResponse.json({ 
          error: 'Failed to save to Supabase', 
          details: error.message 
        }, { status: 500 });
      }
      
      console.log('Supabase save success, result:', result);
      return NextResponse.json({ success: true });
    }
    
    // Supabaseが利用できない場合はエラー
    console.log('Supabase not configured - cannot save data');
    return NextResponse.json({ 
      error: 'Database not configured', 
      details: 'Supabase environment variables not found' 
    }, { status: 500 });
  } catch (err) {
    console.error('Failed to save chat data:', err);
    return NextResponse.json({ 
      error: 'Failed to save data', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}