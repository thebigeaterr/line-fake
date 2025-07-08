# LINE Fake - LINE Mobile Chat Replica

LINEのモバイルチャット画面を再現したWebアプリケーション

## 機能

- ✅ LINEライクなチャット画面
- ✅ メッセージの送信・受信
- ✅ アバター画像の設定
- ✅ チャットルーム管理
- ✅ 管理画面でのメッセージ編集
- ✅ データの永続化（Supabase）
- ✅ レスポンシブデザイン

## 技術スタック

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: React Icons

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/thebigeaterr/line-fake.git
cd line-fake
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseの設定

#### 3.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `line-fake`
4. データベースパスワードを設定
5. リージョン: `Northeast Asia (Tokyo)`
6. 「Create new project」をクリック

#### 3.2 データベーステーブルの作成

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase-setup.sql` の内容をコピー＆ペースト
3. 「Run」をクリックしてテーブルを作成

#### 3.3 環境変数の設定

1. `.env.local.example` を `.env.local` にコピー
2. Supabaseの「Settings」→「API」から以下を取得：
   - Project URL
   - anon public key
3. `.env.local` に値を設定

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## デプロイ

### Vercelでのデプロイ

1. [Vercel](https://vercel.com) にアクセス
2. GitHubリポジトリを接続
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイ

## 使用方法

1. **チャット画面**: メッセージの送信・受信
2. **管理画面**: メニューボタンからアクセス
3. **アバター設定**: 管理画面で画像をアップロード
4. **メッセージ編集**: 管理画面でメッセージを編集・削除

## 開発

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npm run type-check
```

### リント

```bash
npm run lint
```

## ライセンス

MIT License