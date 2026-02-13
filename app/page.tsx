import { createClient } from '@/lib/supabase/server';
import { ShoppingCart, Globe, LayoutDashboard, Package, Truck, TrendingUp, FileSpreadsheet, Upload } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [cartsRes, ecSitesRes, projectsRes, productsRes, shipmentsRes] = await Promise.all([
    (supabase.from('cart_master') as any).select('id', { count: 'exact', head: true }),
    (supabase.from('ec_site_master') as any).select('id', { count: 'exact', head: true }),
    (supabase.from('project_master') as any).select('id', { count: 'exact', head: true }),
    (supabase.from('product_master') as any).select('id', { count: 'exact', head: true }),
    (supabase.from('shipment_records') as any).select('id', { count: 'exact', head: true }),
  ]);

  // Fetch recent shipment records
  const { data: recentShipments } = await (supabase.from('shipment_records') as any)
    .select('id, order_number, product_code, total_amount, shipment_date, warehouse_master(warehouse_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { title: 'カート', value: cartsRes.count ?? 0, icon: ShoppingCart, color: 'bg-blue-500', href: '/cart-master' },
    { title: 'ECサイト', value: ecSitesRes.count ?? 0, icon: Globe, color: 'bg-green-500', href: '/ec-site-master' },
    { title: '案件', value: projectsRes.count ?? 0, icon: LayoutDashboard, color: 'bg-purple-500', href: '/project-master' },
    { title: '商品', value: productsRes.count ?? 0, icon: Package, color: 'bg-orange-500', href: '/product-master' },
    { title: '出荷実績', value: shipmentsRes.count ?? 0, icon: Truck, color: 'bg-teal-500', href: '/shipment-records' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">システム全体の概要と主要な統計情報を確認できます</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">最近の出荷実績</h2>
          <Link href="/sales-report" className="text-sm text-blue-600 hover:text-blue-700">売上報告を見る →</Link>
        </div>
        {recentShipments && recentShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">出荷日</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">受注番号</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">商品コード</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">倉庫</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentShipments.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-900">{s.shipment_date}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-900">{s.order_number}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-600">{s.product_code || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{s.warehouse_master?.warehouse_name || '-'}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-900 text-right">{Number(s.total_amount).toLocaleString()}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>まだ出荷実績がありません</p>
            <p className="text-sm mt-2">WMS出荷実績取込からデータを登録してください</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/product-csv"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">商品CSV取込</p>
              <p className="text-sm text-gray-600">商品データを一括登録</p>
            </div>
          </Link>
          <Link href="/shipment-records"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">WMS出荷実績取込</p>
              <p className="text-sm text-gray-600">出荷データを一括登録</p>
            </div>
          </Link>
          <Link href="/sales-report"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">売上報告</p>
              <p className="text-sm text-gray-600">月次の売上集計を確認</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
