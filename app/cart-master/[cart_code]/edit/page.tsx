'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

type CartMaster = {
  cart_code: string;
  cart_name: string;
  has_project_info_in_csv: boolean;
  remarks: string | null;
};

export default function EditCartPage() {
  const router = useRouter();
  const params = useParams();
  const cartCode = params.cart_code as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    cart_name: '',
    has_project_info_in_csv: false,
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cart_master')
          .select('*')
          .eq('cart_code', cartCode)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setFormData({
            cart_name: data.cart_name,
            has_project_info_in_csv: data.has_project_info_in_csv,
            remarks: data.remarks || '',
          });
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('カートマスタの取得に失敗しました');
      } finally {
        setFetching(false);
      }
    };

    fetchCart();
  }, [cartCode, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('cart_master')
        .update({
          cart_name: formData.cart_name,
          has_project_info_in_csv: formData.has_project_info_in_csv,
          remarks: formData.remarks || null,
        })
        .eq('cart_code', cartCode);

      if (updateError) throw updateError;

      // Success - redirect to list
      router.push('/cart-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('カートマスタの更新に失敗しました');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <Link
          href="/cart-master"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">カートマスタ編集</h1>
        <p className="text-gray-600 mt-2">
          カートコード: <span className="font-mono font-semibold">{cartCode}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Cart Name */}
        <div>
          <label htmlFor="cart_name" className="block text-sm font-medium text-gray-700 mb-2">
            カート名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cart_name"
            required
            value={formData.cart_name}
            onChange={(e) => setFormData({ ...formData, cart_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: サイテキカート"
          />
          <p className="text-sm text-gray-500 mt-1">
            カート・ECサイトの名称を入力してください
          </p>
        </div>

        {/* Has Project Info */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.has_project_info_in_csv}
              onChange={(e) => setFormData({ ...formData, has_project_info_in_csv: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">CSVに案件情報が含まれる</span>
              <p className="text-sm text-gray-500">
                このカートから出力されるCSVに案件情報（案件コード等）が含まれる場合はチェックしてください
              </p>
            </div>
          </label>
        </div>

        {/* Remarks */}
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
            placeholder="補足情報があれば入力してください"
          />
        </div>

        {/* Actions */}
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
            href="/cart-master"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
