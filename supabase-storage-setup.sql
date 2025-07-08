-- Supabase Storageのセットアップ手順
-- 注意: これらの操作はSupabaseダッシュボードのStorageセクションから実行する必要があります

-- 1. Supabaseダッシュボードにログイン
-- 2. 左側メニューから「Storage」を選択
-- 3. 「New bucket」をクリック
-- 4. 以下の設定でバケットを作成:
--    - Name: avatars
--    - Public bucket: ON（チェックを入れる）
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- RLSポリシー（Supabase SQL Editorで実行）
-- 全ユーザーがアップロード可能
CREATE POLICY "Anyone can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 全ユーザーが削除可能
CREATE POLICY "Anyone can delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');