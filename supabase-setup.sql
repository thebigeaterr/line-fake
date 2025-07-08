-- chat_data テーブルを作成
CREATE TABLE chat_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE chat_data ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能なポリシーを作成
CREATE POLICY "Enable read access for all users" ON chat_data
FOR SELECT USING (true);

-- 全ユーザーが書き込み可能なポリシーを作成
CREATE POLICY "Enable insert access for all users" ON chat_data
FOR INSERT WITH CHECK (true);

-- 全ユーザーが更新可能なポリシーを作成
CREATE POLICY "Enable update access for all users" ON chat_data
FOR UPDATE USING (true);

-- 更新時に updated_at を自動更新する関数とトリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_data_updated_at
    BEFORE UPDATE ON chat_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();