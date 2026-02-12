'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

type EcSiteMaster = Database['public']['Tables']['ec_site_master']['Row'];

export default function EditEcSitePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    ec_site_name: '',
    cart_id: '',
    remarks: '',
  });

  const [carts, setCarts] = useState<{ id: string; cart_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteResult, cartsResult] = await Promise.all([
          supabase.from('ec_site_master').select('*').eq('id', id).single<EcSiteMaster>(),
          supabase.from('cart_master').select('id, cart_name').order('cart_name'),
        ]);

        if (siteResult.error) throw siteResult.error;
        if (siteResult.data) {
          setFormData({
            ec_site_name: siteResult.data.ec_site_name,
            cart_id: siteResult.data.cart_id,
            remarks: siteResult.data.remarks || '',
          });
        }
        if (cartsResult.data) setCarts(cartsResult.data);
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
        .from('ec_site_master') as any)
        .update({
          ec_site_name: formData.ec_site_name,
          cart_id: formData.cart_id,
          remarks: formData.remarks.trim() || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/ec-site-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating:', err);
      setError('ECサイトマスタの更新に失敗しました');
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
        <Link
          href="/ec-site-master"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">ECサイトマスタ編集</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="ec_site_name" className="block text-sm font-medium text-gray-700 mb-2">
            ECサイト名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="ec_site_name"
            required
            value={formData.ec_site_name}
            onChange={(e) => setFormData({ ...formData, ec_site_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="cart_id" className="block text-sm font-medium text-gray-700 mb-2">
            カート <span className="text-red-500">*</span>
          </label>
          <select
            id="cart_id"
            required
            value={formData.cart_id}
            onChange={(e) => setFormData({ ...formData, cart_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {carts.map((cart) => (
              <option key={cart.id} value={cart.id}>{cart.cart_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
            備考
          </label>
          <textarea
            id="remarks"
            rows={4}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? '更新中...' : '更新'}
          </button>
          <Link
            href="/ec-site-master"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
