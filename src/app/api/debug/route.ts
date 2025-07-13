import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  console.log('Debug API called');
  try {
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      KEY_VALUE: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    };

    console.log('Environment check:', envCheck);

    // Supabaseへの接続テスト
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data, error } = await supabase
          .from('chat_data')
          .select('*')
          .eq('id', 'default')
          .single();

        return NextResponse.json({
          status: 'Database connected',
          environment: envCheck,
          database_data: data ? 'Data exists' : 'No data',
          database_error: error?.message || null
        });
      } catch (dbError) {
        return NextResponse.json({
          status: 'Database connection failed',
          environment: envCheck,
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
      }
    } else {
      return NextResponse.json({
        status: 'Environment variables missing',
        environment: envCheck,
        message: 'Supabase URL or API key not configured'
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'Debug API failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}