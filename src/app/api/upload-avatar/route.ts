import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `avatars/${fileName}`;
    
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });
      
    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Failed to upload file', details: error.message }, { status: 500 });
    }
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return NextResponse.json({ 
      url: publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}