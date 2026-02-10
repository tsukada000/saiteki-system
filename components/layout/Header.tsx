'use client';

import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            サイテキシステム
          </h2>
          <p className="text-sm text-gray-600">
            データ統合・業務自動化プラットフォーム
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            title="通知"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <button
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="ユーザーメニュー"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">管理者</span>
          </button>
        </div>
      </div>
    </header>
  );
}
