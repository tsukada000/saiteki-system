'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

type WmsMaster = Database['public']['Tables']['wms_master']['Row'];

export default function EditWmsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({ wms_name: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWms = async () => {
      try {
        const { data, error: fetchError } = await supabase.from('wms_master').select('*').eq('id', id).single<WmsMaster>();
        if (fetchError) throw fetchError;
        if (data) setFormData({ wms_name: data.wms_name, remarks: data.remarks || '' });
      } catch (err) {
        console.error('Error fetching WMS:', err);
        setError('データの取得に失敗しました');
      } finally {
        setFetching(false);
      }
    };
    fetchWms();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await (supabase
        .from('wms_master') as any)
        .update({ wms_name: formData.wms_name, remarks: formData.remarks.trim() || null })
        .eq('id', id);
      if (updateError) throw updateError;
      router.push('/wms-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating WMS:', err);
      setError('WMSマスタの更新に失敗しました');
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/wms-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">WMSマスタ編集</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="wms_name" className="block text-sm font-medium text-gray-700 mb-2">
            WMS名 <span className="text-red-500">*</span>
          </label>
          <input type="text" id="wms_name" required value={formData.wms_name}
            onChange={(e) => setFormData({ ...formData, wms_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">備考</label>
          <textarea id="remarks" rows={4} value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '更新中...' : '更新'}
          </button>
          <Link href="/wms-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
