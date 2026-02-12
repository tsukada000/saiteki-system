'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    ec_site_id: '',
    project_id: '',
    category: '',
    product_code: '',
    product_name: '',
    variation: '',
    unit_price: 0,
  });

  const [ecSites, setEcSites] = useState<{ id: string; ec_site_name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasters = async () => {
      const [ecRes, projRes] = await Promise.all([
        (supabase.from('ec_site_master') as any).select('id, ec_site_name').order('ec_site_name'),
        (supabase.from('project_master') as any).select('id, project_name').order('project_name'),
      ]);
      if (ecRes.data) setEcSites(ecRes.data);
      if (projRes.data) setProjects(projRes.data);
    };
    fetchMasters();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase
        .from('product_master') as any)
        .insert([{
          ec_site_id: formData.ec_site_id,
          project_id: formData.project_id || null,
          category: formData.category.trim() || null,
          product_code: formData.product_code,
          product_name: formData.product_name.trim() || null,
          variation: formData.variation.trim() || null,
          unit_price: formData.unit_price,
        }]);
      if (insertError) throw insertError;
      router.push('/product-master');
      router.refresh();
    } catch (err) {
      console.error('Error creating:', err);
      setError('商品の登録に失敗しました。同じECサイト・商品コードの組み合わせが既に存在する可能性があります。');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/product-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">商品新規登録</h1>
        <p className="text-gray-600 mt-2">新しい商品を手動で登録します</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">商品情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ec_site_id" className="block text-sm font-medium text-gray-700 mb-2">
                ECサイト <span className="text-red-500">*</span>
              </label>
              <select id="ec_site_id" required value={formData.ec_site_id}
                onChange={(e) => setFormData({ ...formData, ec_site_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください</option>
                {ecSites.map((s) => (
                  <option key={s.id} value={s.id}>{s.ec_site_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">案件</label>
              <select id="project_id" value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください（任意）</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product_code" className="block text-sm font-medium text-gray-700 mb-2">
                商品コード <span className="text-red-500">*</span>
              </label>
              <input type="text" id="product_code" required value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: ITEM-001" />
            </div>
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-2">商品名</label>
              <input type="text" id="product_name" value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: サンプル商品A" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <input type="text" id="category" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: アパレル" />
            </div>
            <div>
              <label htmlFor="variation" className="block text-sm font-medium text-gray-700 mb-2">バリエーション</label>
              <input type="text" id="variation" value={formData.variation}
                onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: Mサイズ / ブラック" />
            </div>
            <div>
              <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">単価（税込）</label>
              <div className="relative">
                <input type="number" id="unit_price" min="0" step="1" value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">円</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '登録中...' : '登録'}
          </button>
          <Link href="/product-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
