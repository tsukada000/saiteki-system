# サイテキシステム - データ統合とデスク業務自動化

エンタメEC事業者向けのデータ統合・業務自動化システム

## 🎯 プロジェクト概要

複数のECサイトとWMS（倉庫管理システム）からのデータを統合し、請求書作成や売上報告を自動化するWebアプリケーション。

### 主な機能（フェーズ1 MVP）

- ✅ カート・ECサイトマスタ管理
- ✅ WMS・倉庫マスタ管理
- ✅ クライアント・案件マスタ管理
- ✅ 商品情報のCSV一括登録
- ✅ WMS出荷実績データの取り込み
- ✅ 簡易売上報告画面

---

## 📚 技術スタック

### フロントエンド
- **Next.js 14** (App Router) - React フレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - スタイリング
- **React Hook Form** - フォーム管理
- **Zod** - バリデーション

### バックエンド & データベース
- **Supabase** - PostgreSQL + REST API + 認証
  - 無料プラン: 500MB DB + 1GB ストレージ
  - 自動バックアップ
  - Row Level Security (RLS)

### ホスティング
- **Vercel** - フロントエンド（無料）
- **Supabase** - バックエンド（無料）

---

## 🚀 セットアップ手順

### 前提条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント（無料）

### 1. リポジトリのクローン

```bash
cd "D:\Job\3．JamWorks"
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. Supabaseプロジェクトのセットアップ

詳細は [docs/supabase-setup.md](docs/supabase-setup.md) を参照してください。

簡単な手順:
1. [Supabase](https://supabase.com/)でアカウント作成
2. 新しいプロジェクトを作成（Tokyo リージョン推奨）
3. API認証情報を取得
4. SQL Editorで `supabase/migrations/20250210_initial_schema.sql` を実行

### 4. 環境変数の設定

`.env.local` ファイルを作成:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

---

## 📁 プロジェクト構造

```
D:\Job\3．JamWorks\
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # ホームページ
│   └── (routes)/                # ルートグループ
│       ├── cart-master/         # カートマスタ管理
│       ├── ec-site-master/      # ECサイトマスタ管理
│       ├── client-master/       # クライアントマスタ管理
│       └── ...
├── components/                   # Reactコンポーネント
│   ├── ui/                      # 再利用可能UIコンポーネント
│   └── forms/                   # フォームコンポーネント
├── lib/                         # ユーティリティ関数
│   ├── supabase/                # Supabaseクライアント設定
│   │   ├── client.ts           # クライアントサイド用
│   │   └── server.ts           # サーバーサイド用
│   └── utils.ts                 # 汎用ユーティリティ
├── types/                       # TypeScript型定義
│   └── database.ts              # Supabase型定義
├── supabase/                    # Supabase設定
│   └── migrations/              # DBマイグレーションSQL
│       └── 20250210_initial_schema.sql
├── docs/                        # ドキュメント
│   ├── database-design.md       # DB設計書
│   └── supabase-setup.md        # Supabaseセットアップガイド
└── package.json
```

---

## 🗄️ データベース設計

詳細は [docs/database-design.md](docs/database-design.md) を参照してください。

### 主要テーブル

1. **cart_master** - カートマスタ（サイテキカート、BASE、STORES等）
2. **ec_site_master** - ECサイトマスタ
3. **wms_master** - WMSマスタ
4. **warehouse_master** - 倉庫マスタ
5. **client_master** - クライアントマスタ
6. **project_master** - 案件マスタ
7. **product_master** - 商品マスタ
8. **shipment_records** - 出荷実績データ

---

## 💻 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# リント実行
npm run lint
```

---

## 📊 開発ロードマップ

### ✅ フェーズ1: コアMVP（現在）
- [x] プロジェクト構造の作成
- [x] データベース設計
- [x] Supabaseセットアップ
- [ ] マスタ管理画面の実装
- [ ] CSV登録機能
- [ ] 簡易売上報告画面

### 🔜 フェーズ2: 請求書機能
- [ ] イレギュラー請求登録
- [ ] 請求書PDF作成
- [ ] 請求書メール送信
- [ ] 案件集計画面

### 🔜 フェーズ3: 本格展開
- [ ] 全ECサイト対応
- [ ] 複数WMS対応
- [ ] 在庫管理機能
- [ ] 入荷・出荷管理
- [ ] 権限管理（サイテキ・クライアント・倉庫）

---

## 🆓 無料リソースの活用

### Supabase（無料プラン）
- データベース容量: 500MB
- ストレージ: 1GB
- 帯域幅: 2GB/月
- **MVP開発には十分**

### Vercel（無料プラン）
- ホスティング: 無制限
- ビルド時間: 100時間/月
- 帯域幅: 100GB/月

**⚠️ 注意:** 本番運用時は有料プランへの移行を推奨（Supabase Pro: $25/月）

---

## 🐛 トラブルシューティング

### データベース接続エラー
1. `.env.local` ファイルが存在するか確認
2. Supabase URLとAPI Keyが正しいか確認
3. 開発サーバーを再起動

### マイグレーションエラー
1. Supabase SQL Editorでエラーメッセージを確認
2. テーブルが既に存在する場合は削除してから再実行
3. [docs/supabase-setup.md](docs/supabase-setup.md) を参照

---

## 📝 ライセンス

このプロジェクトは私的利用のために作成されています。

---

## 🤝 サポート

問題が発生した場合は、以下のドキュメントを参照してください:
- [Supabaseセットアップガイド](docs/supabase-setup.md)
- [データベース設計書](docs/database-design.md)
