'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewWmsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({ wms_name: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase
        .from('wms_master') as any)
        .insert([{ wms_name: formData.wms_name, remarks: formData.remarks.trim() || null }]);
      if (insertError) throw insertError;
      router.push('/wms-master');
      router.refresh();
    } catch (err) {
      console.error('Error creating WMS:', err);
      setError('WMSマスタの登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/wms-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">WMSマスタ新規登録</h1>
        <p className="text-gray-600 mt-2">新しいWMSの情報を登録します</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="wms_name" className="block text-sm font-medium text-gray-700 mb-2">
            WMS名 <span className="text-red-500">*</span>
          </label>
          <input type="text" id="wms_name" required value={formData.wms_name}
            onChange={(e) => setFormData({ ...formData, wms_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: イープラスショップ" />
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">備考</label>
          <textarea id="remarks" rows={4} value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="補足情報があれば入力してください" />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '登録中...' : '登録'}
          </button>
          <Link href="/wms-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
