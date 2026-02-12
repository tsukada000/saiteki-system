'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    project_name: '',
    project_number: '',
    client_id: '',
    start_date: '',
    end_date: '',
    sales_commission_rate: 0,
    warehouse_id: '',
    billing_category_id: '',
    remarks: '',
  });

  const [clients, setClients] = useState<{ id: string; client_name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; warehouse_name: string }[]>([]);
  const [billingCategories, setBillingCategories] = useState<{ id: string; category_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, clientsRes, warehousesRes, categoriesRes] = await Promise.all([
          (supabase.from('project_master') as any).select('*').eq('id', id).single(),
          (supabase.from('client_master') as any).select('id, client_name').order('client_name'),
          (supabase.from('warehouse_master') as any).select('id, warehouse_name').order('warehouse_name'),
          (supabase.from('billing_category_master') as any).select('id, category_name').order('category_name'),
        ]);

        if (projectRes.error) throw projectRes.error;
        if (projectRes.data) {
          const d = projectRes.data;
          setFormData({
            project_name: d.project_name,
            project_number: d.project_number,
            client_id: d.client_id,
            start_date: d.start_date || '',
            end_date: d.end_date || '',
            sales_commission_rate: Number(d.sales_commission_rate) || 0,
            warehouse_id: d.warehouse_id || '',
            billing_category_id: d.billing_category_id || '',
            remarks: d.remarks || '',
          });
        }

        if (clientsRes.data) setClients(clientsRes.data);
        if (warehousesRes.data) setWarehouses(warehousesRes.data);
        if (categoriesRes.data) setBillingCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching:', err);
        setError('データの取得に失敗しました');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await (supabase
        .from('project_master') as any)
        .update({
          project_name: formData.project_name,
          client_id: formData.client_id,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          sales_commission_rate: formData.sales_commission_rate,
          warehouse_id: formData.warehouse_id || null,
          billing_category_id: formData.billing_category_id || null,
          remarks: formData.remarks.trim() || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/project-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating:', err);
      setError('案件の更新に失敗しました');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/project-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">案件編集</h1>
        <p className="text-gray-600 mt-2">
          案件番号: <span className="font-mono font-semibold">{formData.project_number}</span>
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">基本情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-2">
                案件名 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="project_name" required value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                クライアント <span className="text-red-500">*</span>
              </label>
              <select id="client_id" required value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.client_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
              <input type="date" id="start_date" value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
              <input type="date" id="end_date" value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* 詳細設定 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">詳細設定</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sales_commission_rate" className="block text-sm font-medium text-gray-700 mb-2">販売手数料率</label>
              <div className="relative">
                <input type="number" id="sales_commission_rate" min="0" max="100" step="0.01"
                  value={formData.sales_commission_rate}
                  onChange={(e) => setFormData({ ...formData, sales_commission_rate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </div>

            <div>
              <label htmlFor="warehouse_id" className="block text-sm font-medium text-gray-700 mb-2">出荷倉庫</label>
              <select id="warehouse_id" value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="billing_category_id" className="block text-sm font-medium text-gray-700 mb-2">請求区分</label>
              <select id="billing_category_id" value={formData.billing_category_id}
                onChange={(e) => setFormData({ ...formData, billing_category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください</option>
                {billingCategories.map((bc) => (
                  <option key={bc.id} value={bc.id}>{bc.category_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 備考 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">その他</h2>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">備考</label>
            <textarea id="remarks" rows={4} value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '更新中...' : '更新'}
          </button>
          <Link href="/project-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
