import { createClient } from '@/lib/supabase/server';
import { Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function ProductCsvMasterPage() {
  const supabase = await createClient();

  const { data: csvMasters, error } = await (supabase
    .from('product_csv_master') as any)
    .select('*, cart_master(cart_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product csv masters:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商品CSVマスタ管理</h1>
          <p className="text-gray-600 mt-2">カートごとの商品CSVフォーマットを管理します</p>
        </div>
        <Link
          href="/product-csv-master/new"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カート</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品コード列</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名列</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価列</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件名列</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {csvMasters && csvMasters.length > 0 ? (
                csvMasters.map((csv: any) => (
                  <tr key={csv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {csv.cart_master?.cart_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{csv.product_code_column}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{csv.product_name_column || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{csv.unit_price_column || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{csv.project_name_column || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/product-csv-master/${csv.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="編集">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={csv.id} name={csv.cart_master?.cart_name || '商品CSV'} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">商品CSVマスタが登録されていません</p>
                    <p className="text-sm mt-2">「新規登録」ボタンから追加してください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {csvMasters && csvMasters.length > 0 && (
        <div className="text-sm text-gray-600">
          全 <span className="font-semibold text-gray-900">{csvMasters.length}</span> 件
        </div>
      )}
    </div>
  );
}
