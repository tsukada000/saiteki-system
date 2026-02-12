import { createClient } from '@/lib/supabase/server';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function EcSiteMasterPage() {
  const supabase = await createClient();

  const { data: ecSites, error } = await (supabase
    .from('ec_site_master') as any)
    .select('*, cart_master(cart_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ec sites:', error);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ECサイトマスタ管理</h1>
          <p className="text-gray-600 mt-2">
            ECサイトの基本情報を管理します
          </p>
        </div>
        <Link
          href="/ec-site-master/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新規登録
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ECサイト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カート
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  備考
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ecSites && ecSites.length > 0 ? (
                ecSites.map((site: any) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {site.ec_site_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {(site.cart_master as any)?.cart_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {site.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ec-site-master/${site.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={site.id} name={site.ec_site_name} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">ECサイトマスタが登録されていません</p>
                    <p className="text-sm mt-2">「新規登録」ボタンから追加してください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ecSites && ecSites.length > 0 && (
        <div className="text-sm text-gray-600">
          全 <span className="font-semibold text-gray-900">{ecSites.length}</span> 件
        </div>
      )}
    </div>
  );
}
