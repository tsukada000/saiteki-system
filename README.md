# JamWorks - フルスタックWebアプリケーション

## 技術スタック

### フロントエンド & バックエンド
- **Next.js 14** (App Router) - React フレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS

### データベース（予定）
- **SQLite** (開発環境)
- **PostgreSQL** (本番環境への移行可能)

### 認証（予定）
- **NextAuth.js** - 認証ライブラリ

### デプロイ
- **Vercel** - 無料ホスティング

## セットアップ

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
.
├── app/                # Next.js App Router
│   ├── layout.tsx     # ルートレイアウト
│   ├── page.tsx       # ホームページ
│   └── globals.css    # グローバルスタイル
├── components/        # Reactコンポーネント
├── lib/              # ユーティリティ関数
├── public/           # 静的ファイル
└── package.json
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
```

## 無料リソース

- **Next.js**: 完全無料
- **Vercel**: 無料枠で十分な機能
- **Tailwind CSS**: 完全無料
- **SQLite**: 完全無料（開発用）

## 今後の拡張予定

- [ ] データベース統合（Prisma ORM）
- [ ] 認証機能（NextAuth.js）
- [ ] API Routes
- [ ] フォームバリデーション
- [ ] ユニットテスト
