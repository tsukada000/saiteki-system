'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProductCsvMasterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    cart_id: '',
    cart_name: '',
    product_code_column: '',
    product_name_column: '',
    unit_price_column: '',
    project_name_column: '',
    category_column: '',
    variation_column: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await (supabase
          .from('product_csv_master') as any)
          .select('*, cart_master(cart_name)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setFormData({
            cart_id: data.cart_id,
            cart_name: data.cart_master?.cart_name || '',
            product_code_column: data.product_code_column || '',
            product_name_column: data.product_name_column || '',
            unit_price_column: data.unit_price_column || '',
            project_name_column: data.project_name_column || '',
            category_column: data.category_column || '',
            variation_column: data.variation_column || '',
          });
        }
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
        .from('product_csv_master') as any)
        .update({
          product_code_column: formData.product_code_column,
          product_name_column: formData.product_name_column.trim() || null,
          unit_price_column: formData.unit_price_column.trim() || null,
          project_name_column: formData.project_name_column.trim() || null,
          category_column: formData.category_column.trim() || null,
          variation_column: formData.variation_column.trim() || null,
        })
        .eq('id', id);
      if (updateError) throw updateError;
      router.push('/product-csv-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating:', err);
      setError('更新に失敗しました');
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
        <Link href="/product-csv-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">商品CSVマスタ編集</h1>
        <p className="text-gray-600 mt-2">
          カート: <span className="font-semibold">{formData.cart_name}</span>
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">CSV列設定</h2>
          <p className="text-sm text-gray-500">CSVの列位置をアルファベットで指定します（例: A, B, C ...）</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="product_code_column" className="block text-sm font-medium text-gray-700 mb-2">
                商品コード列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="product_code_column" required value={formData.product_code_column}
                onChange={(e) => setFormData({ ...formData, product_code_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="product_name_column" className="block text-sm font-medium text-gray-700 mb-2">商品名列</label>
              <input type="text" id="product_name_column" value={formData.product_name_column}
                onChange={(e) => setFormData({ ...formData, product_name_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="unit_price_column" className="block text-sm font-medium text-gray-700 mb-2">販売単価（税込）列</label>
              <input type="text" id="unit_price_column" value={formData.unit_price_column}
                onChange={(e) => setFormData({ ...formData, unit_price_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="category_column" className="block text-sm font-medium text-gray-700 mb-2">カテゴリ列</label>
              <input type="text" id="category_column" value={formData.category_column}
                onChange={(e) => setFormData({ ...formData, category_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="variation_column" className="block text-sm font-medium text-gray-700 mb-2">バリエーション列</label>
              <input type="text" id="variation_column" value={formData.variation_column}
                onChange={(e) => setFormData({ ...formData, variation_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="project_name_column" className="block text-sm font-medium text-gray-700 mb-2">案件名列</label>
              <input type="text" id="project_name_column" value={formData.project_name_column}
                onChange={(e) => setFormData({ ...formData, project_name_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '更新中...' : '更新'}
          </button>
          <Link href="/product-csv-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
