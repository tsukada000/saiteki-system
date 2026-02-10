# Supabaseセットアップ手順

## 概要
このガイドでは、無料のSupabaseプロジェクトを作成し、サイテキシステムに接続する手順を説明します。

---

## ステップ1: Supabaseアカウントの作成

1. [Supabase](https://supabase.com/)にアクセス
2. 「Start your project」ボタンをクリック
3. GitHubアカウントでサインアップ（推奨）またはメールアドレスで登録
4. アカウント認証を完了

---

## ステップ2: 新しいプロジェクトの作成

1. Supabaseダッシュボードで「New Project」をクリック
2. プロジェクト情報を入力:
   - **Name**: `saiteki-system` (任意の名前)
   - **Database Password**: 強力なパスワードを設定（**必ず保存してください**）
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本に最も近いリージョン）
   - **Pricing Plan**: **Free** を選択
3. 「Create new project」をクリック
4. プロジェクトの作成完了を待つ（1-2分程度）

---

## ステップ3: API認証情報の取得

1. プロジェクトダッシュボードで左サイドバーの **Settings** (⚙️) をクリック
2. **API** セクションを選択
3. 以下の情報をコピー:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co` の形式
   - **anon public key**: `eyJ...` で始まる長いキー

---

## ステップ4: 環境変数の設定

1. プロジェクトルートディレクトリで `.env.local` ファイルを作成
2. 以下の内容を貼り付け（コピーした値を使用）:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**⚠️ 重要:** `.env.local` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

---

## ステップ5: データベーススキーマの作成

### 方法1: SQL Editorを使用（推奨）

1. Supabaseダッシュボードで **SQL Editor** を開く
2. 「New query」をクリック
3. `supabase/migrations/20250210_initial_schema.sql` の内容を全てコピー
4. SQL Editorに貼り付け
5. 「Run」ボタンをクリックして実行
6. 「Success」メッセージが表示されることを確認

### 方法2: Supabase CLIを使用（上級者向け）

```bash
# Supabase CLIをインストール
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトに接続
supabase link --project-ref your-project-id

# マイグレーションを実行
supabase db push
```

---

## ステップ6: テーブルの確認

1. Supabaseダッシュボードで **Table Editor** を開く
2. 以下のテーブルが作成されていることを確認:
   - `cart_master` (5行のデータが挿入されている)
   - `ec_site_master`
   - `wms_master`
   - `warehouse_master`
   - `billing_category_master`
   - `client_master`
   - `client_contacts`
   - `project_master`
   - `product_csv_master`
   - `product_master`
   - `wms_csv_master`
   - `shipment_records`

3. `cart_master` テーブルを開いて、初期データが挿入されていることを確認:
   - サイテキカート
   - ネルケオンラインショップ
   - BASE
   - カラーミー
   - STORES

---

## ステップ7: 開発サーバーの起動

```bash
# プロジェクトディレクトリに移動
cd "D:\Job\3．JamWorks"

# 依存パッケージのインストール（まだの場合）
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてアプリケーションが起動することを確認してください。

---

## トラブルシューティング

### エラー: "Invalid API key"
- `.env.local` ファイルの `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
- Supabaseダッシュボードから最新の anon key を再コピー
- 開発サーバーを再起動 (`npm run dev`)

### エラー: "relation does not exist"
- SQL Editorでマイグレーションスクリプトが正常に実行されたか確認
- エラーメッセージがある場合は、その内容を確認
- テーブルが作成されているか Table Editor で確認

### データベース接続エラー
- `NEXT_PUBLIC_SUPABASE_URL` が正しいか確認
- Supabaseプロジェクトが正常に起動しているか確認（ダッシュボードで確認）

---

## 無料プランの制限

Supabase無料プランには以下の制限があります：

- **データベース容量**: 500MB
- **ストレージ**: 1GB
- **帯域幅**: 2GB/月
- **API リクエスト**: 無制限（合理的な使用範囲内）
- **プロジェクト数**: 2つまで

**MVP開発には十分ですが、本番運用時は Pro プラン（$25/月）への移行を検討してください。**

---

## 次のステップ

Supabaseのセットアップが完了したら、フロントエンド画面の実装に進みます：

1. カートマスタ登録画面
2. ECサイトマスタ登録画面
3. クライアント・案件マスタ登録画面
4. 商品CSV登録機能
5. WMS出荷実績データ登録機能
6. 簡易売上報告画面
