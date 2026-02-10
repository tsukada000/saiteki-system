# JamWorks - フルスタックWeb開発プロジェクト

## プロジェクト概要
Next.js 14とTypeScriptを使用したフルスタックWebアプリケーション開発プロジェクト

## 技術スタック
- **フロントエンド**: Next.js 14 (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite (開発), PostgreSQL (本番)
- **認証**: NextAuth.js
- **デプロイ**: Vercel

## 開発ガイドライン

### コーディング規約
- TypeScriptの型定義を必ず使用すること
- コンポーネントは関数コンポーネントで実装
- ファイル名はケバブケース (例: `user-profile.tsx`)
- コンポーネント名はパスカルケース (例: `UserProfile`)

### ディレクトリ構造
```
app/              # Next.js App Router (ページとレイアウト)
components/       # 再利用可能なReactコンポーネント
lib/             # ユーティリティ関数とヘルパー
public/          # 静的アセット
```

### Git運用
- 機能ごとにブランチを作成
- コミットメッセージは日本語で簡潔に
- プッシュ前に必ず`npm run lint`を実行

### 環境変数
- 機密情報は`.env.local`に保存（Gitにコミットしない）
- `.env.example`にテンプレートを記載

## ベストプラクティス
- Server ComponentsとClient Componentsを適切に使い分ける
- 'use client'は必要な場合のみ使用
- SEO対策のためmetadataを適切に設定
- パフォーマンス最適化（画像最適化、動的インポートなど）

## テスト環境
このプロジェクトはテスト・学習目的のため、完全無料の環境で構築されています
