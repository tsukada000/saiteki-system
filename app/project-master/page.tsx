import { createClient } from '@/lib/supabase/server';
import { Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function ProjectMasterPage() {
  const supabase = await createClient();

  const { data: projects, error } = await (supabase
    .from('project_master') as any)
    .select('*, client_master(client_name), warehouse_master(warehouse_name), billing_category_master(category_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">案件マスタ管理</h1>
          <p className="text-gray-600 mt-2">販売案件の情報を管理します</p>
        </div>
        <Link
          href="/project-master/new"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クライアント</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手数料率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出荷倉庫</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">請求区分</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects && projects.length > 0 ? (
                projects.map((proj: any) => (
                  <tr key={proj.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                      {proj.project_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proj.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {proj.client_master?.client_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proj.start_date || '未設定'} ～ {proj.end_date || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {Number(proj.sales_commission_rate)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proj.warehouse_master ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {proj.warehouse_master.warehouse_name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proj.billing_category_master ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                          {proj.billing_category_master.category_name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/project-master/${proj.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={proj.id} name={proj.project_name} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">案件が登録されていません</p>
                    <p className="text-sm mt-2">「新規登録」ボタンから追加してください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {projects && projects.length > 0 && (
        <div className="text-sm text-gray-600">
          全 <span className="font-semibold text-gray-900">{projects.length}</span> 件
        </div>
      )}
    </div>
  );
}
