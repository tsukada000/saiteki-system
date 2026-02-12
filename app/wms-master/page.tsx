import { createClient } from '@/lib/supabase/server';
import { Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function WmsMasterPage() {
  const supabase = await createClient();

  const { data: wmsList, error } = await (supabase
    .from('wms_master') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching WMS:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WMSマスタ管理</h1>
          <p className="text-gray-600 mt-2">倉庫管理システム（WMS）の情報を管理します</p>
        </div>
        <Link
          href="/wms-master/new"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WMS名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wmsList && wmsList.length > 0 ? (
                wmsList.map((wms: any) => (
                  <tr key={wms.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wms.wms_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{wms.remarks || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/wms-master/${wms.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="編集">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={wms.id} name={wms.wms_name} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">WMSマスタが登録されていません</p>
                    <p className="text-sm mt-2">「新規登録」ボタンから追加してください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {wmsList && wmsList.length > 0 && (
        <div className="text-sm text-gray-600">
          全 <span className="font-semibold text-gray-900">{wmsList.length}</span> 件
        </div>
      )}
    </div>
  );
}
