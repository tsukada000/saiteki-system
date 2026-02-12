import { createClient } from '@/lib/supabase/server';
import { Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function ProductMasterPage() {
  const supabase = await createClient();

  const { data: products, error } = await (supabase
    .from('product_master') as any)
    .select('*, ec_site_master(ec_site_name), project_master(project_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商品マスタ管理</h1>
          <p className="text-gray-600 mt-2">商品の基本情報を管理します（CSV取込で自動登録も可能）</p>
        </div>
        <Link
          href="/product-master/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新規登録
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品コード</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ECサイト</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">バリエーション</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products && products.length > 0 ? (
                products.map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{prod.product_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prod.product_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {prod.ec_site_master?.ec_site_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {prod.project_master ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {prod.project_master.project_name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {Number(prod.unit_price).toLocaleString()}円
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{prod.variation || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/product-master/${prod.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="編集">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={prod.id} name={prod.product_code} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">商品が登録されていません</p>
                    <p className="text-sm mt-2">「新規登録」ボタンまたはCSV取込から追加してください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {products && products.length > 0 && (
        <div className="text-sm text-gray-600">
          全 <span className="font-semibold text-gray-900">{products.length}</span> 件
        </div>
      )}
    </div>
  );
}
