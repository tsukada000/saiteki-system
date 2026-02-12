'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductCsvMasterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    cart_id: '',
    product_code_column: '',
    product_name_column: '',
    unit_price_column: '',
    project_name_column: '',
    category_column: '',
    variation_column: '',
  });

  const [carts, setCarts] = useState<{ id: string; cart_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarts = async () => {
      const { data } = await (supabase.from('cart_master') as any).select('id, cart_name').order('cart_name');
      if (data) setCarts(data);
    };
    fetchCarts();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase
        .from('product_csv_master') as any)
        .insert([{
          cart_id: formData.cart_id,
          product_code_column: formData.product_code_column,
          product_name_column: formData.product_name_column.trim() || null,
          unit_price_column: formData.unit_price_column.trim() || null,
          project_name_column: formData.project_name_column.trim() || null,
          category_column: formData.category_column.trim() || null,
          variation_column: formData.variation_column.trim() || null,
        }]);
      if (insertError) throw insertError;
      router.push('/product-csv-master');
      router.refresh();
    } catch (err) {
      console.error('Error creating:', err);
      setError('商品CSVマスタの登録に失敗しました。このカートには既に設定が存在する可能性があります。');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/product-csv-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">商品CSVマスタ新規登録</h1>
        <p className="text-gray-600 mt-2">カートの商品CSVフォーマット（列位置）を設定します</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">対象カート</h2>
          <div>
            <label htmlFor="cart_id" className="block text-sm font-medium text-gray-700 mb-2">
              カート <span className="text-red-500">*</span>
            </label>
            <select id="cart_id" required value={formData.cart_id}
              onChange={(e) => setFormData({ ...formData, cart_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">選択してください</option>
              {carts.map((c) => (
                <option key={c.id} value={c.id}>{c.cart_name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">1カートにつき1つのCSV設定を登録できます</p>
          </div>
        </div>

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
                placeholder="例: A" maxLength={10} />
            </div>
            <div>
              <label htmlFor="product_name_column" className="block text-sm font-medium text-gray-700 mb-2">商品名列</label>
              <input type="text" id="product_name_column" value={formData.product_name_column}
                onChange={(e) => setFormData({ ...formData, product_name_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: B" maxLength={10} />
            </div>
            <div>
              <label htmlFor="unit_price_column" className="block text-sm font-medium text-gray-700 mb-2">販売単価（税込）列</label>
              <input type="text" id="unit_price_column" value={formData.unit_price_column}
                onChange={(e) => setFormData({ ...formData, unit_price_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: F" maxLength={10} />
            </div>
            <div>
              <label htmlFor="category_column" className="block text-sm font-medium text-gray-700 mb-2">カテゴリ列</label>
              <input type="text" id="category_column" value={formData.category_column}
                onChange={(e) => setFormData({ ...formData, category_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: D" maxLength={10} />
            </div>
            <div>
              <label htmlFor="variation_column" className="block text-sm font-medium text-gray-700 mb-2">バリエーション列</label>
              <input type="text" id="variation_column" value={formData.variation_column}
                onChange={(e) => setFormData({ ...formData, variation_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: E" maxLength={10} />
            </div>
            <div>
              <label htmlFor="project_name_column" className="block text-sm font-medium text-gray-700 mb-2">案件名列</label>
              <input type="text" id="project_name_column" value={formData.project_name_column}
                onChange={(e) => setFormData({ ...formData, project_name_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: C" maxLength={10} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '登録中...' : '登録'}
          </button>
          <Link href="/product-csv-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
