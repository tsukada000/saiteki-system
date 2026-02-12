'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditWmsCsvMasterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    wms_name: '',
    order_number_column: '',
    product_code_column: '',
    shipment_quantity_column: '',
    unit_price_column: '',
    shipment_date_column: '',
    shipping_fee_column: '',
    shipping_fee_target: '',
    payment_fee_column: '',
    payment_fee_target: '',
    cod_fee_column: '',
    cod_fee_target: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await (supabase
          .from('wms_csv_master') as any)
          .select('*, wms_master(wms_name)')
          .eq('id', id)
          .single();
        if (fetchError) throw fetchError;
        if (data) {
          setFormData({
            wms_name: data.wms_master?.wms_name || '',
            order_number_column: data.order_number_column || '',
            product_code_column: data.product_code_column || '',
            shipment_quantity_column: data.shipment_quantity_column || '',
            unit_price_column: data.unit_price_column || '',
            shipment_date_column: data.shipment_date_column || '',
            shipping_fee_column: data.shipping_fee_column || '',
            shipping_fee_target: data.shipping_fee_target || '',
            payment_fee_column: data.payment_fee_column || '',
            payment_fee_target: data.payment_fee_target || '',
            cod_fee_column: data.cod_fee_column || '',
            cod_fee_target: data.cod_fee_target || '',
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
        .from('wms_csv_master') as any)
        .update({
          order_number_column: formData.order_number_column,
          product_code_column: formData.product_code_column,
          shipment_quantity_column: formData.shipment_quantity_column,
          unit_price_column: formData.unit_price_column,
          shipment_date_column: formData.shipment_date_column,
          shipping_fee_column: formData.shipping_fee_column.trim() || null,
          shipping_fee_target: formData.shipping_fee_target.trim() || null,
          payment_fee_column: formData.payment_fee_column.trim() || null,
          payment_fee_target: formData.payment_fee_target.trim() || null,
          cod_fee_column: formData.cod_fee_column.trim() || null,
          cod_fee_target: formData.cod_fee_target.trim() || null,
        })
        .eq('id', id);
      if (updateError) throw updateError;
      router.push('/wms-csv-master');
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/wms-csv-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">WMS CSVマスタ編集</h1>
        <p className="text-gray-600 mt-2">
          WMS: <span className="font-semibold">{formData.wms_name}</span>
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">必須列設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="order_number_column" className="block text-sm font-medium text-gray-700 mb-2">
                受注番号列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="order_number_column" required value={formData.order_number_column}
                onChange={(e) => setFormData({ ...formData, order_number_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="product_code_column" className="block text-sm font-medium text-gray-700 mb-2">
                商品コード列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="product_code_column" required value={formData.product_code_column}
                onChange={(e) => setFormData({ ...formData, product_code_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipment_quantity_column" className="block text-sm font-medium text-gray-700 mb-2">
                出荷数列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="shipment_quantity_column" required value={formData.shipment_quantity_column}
                onChange={(e) => setFormData({ ...formData, shipment_quantity_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="unit_price_column" className="block text-sm font-medium text-gray-700 mb-2">
                販売単価列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="unit_price_column" required value={formData.unit_price_column}
                onChange={(e) => setFormData({ ...formData, unit_price_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipment_date_column" className="block text-sm font-medium text-gray-700 mb-2">
                出荷完了日列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="shipment_date_column" required value={formData.shipment_date_column}
                onChange={(e) => setFormData({ ...formData, shipment_date_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">手数料列設定（任意）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="shipping_fee_column" className="block text-sm font-medium text-gray-700 mb-2">送料列</label>
              <input type="text" id="shipping_fee_column" value={formData.shipping_fee_column}
                onChange={(e) => setFormData({ ...formData, shipping_fee_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipping_fee_target" className="block text-sm font-medium text-gray-700 mb-2">送料の対象項目名</label>
              <input type="text" id="shipping_fee_target" value={formData.shipping_fee_target}
                onChange={(e) => setFormData({ ...formData, shipping_fee_target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="payment_fee_column" className="block text-sm font-medium text-gray-700 mb-2">コンビニ決済手数料列</label>
              <input type="text" id="payment_fee_column" value={formData.payment_fee_column}
                onChange={(e) => setFormData({ ...formData, payment_fee_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="payment_fee_target" className="block text-sm font-medium text-gray-700 mb-2">決済手数料の対象項目名</label>
              <input type="text" id="payment_fee_target" value={formData.payment_fee_target}
                onChange={(e) => setFormData({ ...formData, payment_fee_target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="cod_fee_column" className="block text-sm font-medium text-gray-700 mb-2">引取手数料列</label>
              <input type="text" id="cod_fee_column" value={formData.cod_fee_column}
                onChange={(e) => setFormData({ ...formData, cod_fee_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" maxLength={10} />
            </div>
            <div>
              <label htmlFor="cod_fee_target" className="block text-sm font-medium text-gray-700 mb-2">引取手数料の対象項目名</label>
              <input type="text" id="cod_fee_target" value={formData.cod_fee_target}
                onChange={(e) => setFormData({ ...formData, cod_fee_target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '更新中...' : '更新'}
          </button>
          <Link href="/wms-csv-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
