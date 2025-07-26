import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 危険なdefaultDataを削除 - ユーザーデータを上書きする原因だった


// GET: データを読み込み
export async function GET(request: NextRequest) {
  try {
    // Check if this is a debug request
    const url = new URL(request.url);
    if (url.searchParams.get('debug') === 'true') {
      // Try to fetch actual data from database
      let dbStatus = 'Starting check';
      let dbData = null;
      let dbError = null;
      
      // Always try to connect regardless of env check
      try {
        const { data, error } = await supabase
          .from('chat_data')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (error) {
          dbStatus = 'Error';
          dbError = error.message;
        } else {
          dbStatus = 'Connected';
          dbData = data ? 'Data exists' : 'No data';
        }
      } catch (e) {
        dbStatus = 'Exception';
        dbError = e instanceof Error ? e.message : 'Unknown error';
      }
      
      return NextResponse.json({
        status: 'Debug info',
        environment: {
          SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
          KEY_VALUE: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
        },
        database: {
          status: dbStatus,
          data: dbData,
          error: dbError
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
        
        // データが存在しない場合
        if (error.code === 'PGRST116') {
          console.log('No data found in database');
          // 空の配列を返す（デフォルトデータは挿入しない）
          return NextResponse.json({
            data: [],
            timestamp: 0,
            updated_at: null
          });
        }
        
        return NextResponse.json({ 
          error: 'Failed to read from Supabase', 
          details: error.message 
        }, { status: 500 });
      }
      
      console.log('Supabase read success');
      // タイムスタンプ情報と共に返す
      return NextResponse.json({
        data: data.data,
        timestamp: data.last_updated || Date.now(),
        updated_at: data.updated_at
      });
    }
    
    // Supabaseが利用できない場合は空の配列を返す
    console.log('Supabase not configured - returning empty data');
    return NextResponse.json({
      data: [],
      timestamp: 0,
      updated_at: null
    });
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
      
      // タイムスタンプ付きでデータを更新（古いデータの上書きを防ぐ）
      const timestamp = Date.now();
      const { error, data: result } = await supabase
        .from('chat_data')
        .upsert([
          { 
            id: 'default', 
            data: cleanData,
            last_updated: timestamp,
            updated_at: new Date().toISOString()
          }
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
    
    // Supabaseが利用できない場合は成功として扱う（クライアント側でlocalStorageに保存される）
    console.log('Supabase not configured - data will be saved to localStorage on client');
    return NextResponse.json({ 
      success: true, 
      message: 'Database not configured, using localStorage fallback' 
    });
  } catch (err) {
    console.error('Failed to save chat data:', err);
    return NextResponse.json({ 
      error: 'Failed to save data', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}