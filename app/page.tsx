import { LayoutDashboard, ShoppingCart, Globe, TrendingUp, Package } from 'lucide-react';

export default function Home() {
  const stats = [
    {
      title: 'カートマスタ',
      value: '5',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'ECサイト',
      value: '0',
      icon: Globe,
      color: 'bg-green-500',
    },
    {
      title: '案件',
      value: '0',
      icon: LayoutDashboard,
      color: 'bg-purple-500',
    },
    {
      title: '商品',
      value: '0',
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          システム全体の概要と主要な統計情報を確認できます
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の活動</h2>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>まだ活動履歴がありません</p>
          <p className="text-sm mt-2">データを登録すると、ここに表示されます</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/cart-master"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">カートマスタ管理</p>
              <p className="text-sm text-gray-600">カート情報を管理</p>
            </div>
          </a>
          <a
            href="/ec-site-master"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">ECサイトマスタ管理</p>
              <p className="text-sm text-gray-600">ECサイト情報を管理</p>
            </div>
          </a>
          <a
            href="/product-csv"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900">商品CSV登録</p>
              <p className="text-sm text-gray-600">商品データを一括登録</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
