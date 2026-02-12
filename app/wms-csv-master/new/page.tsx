'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewWmsCsvMasterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    wms_id: '',
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

  const [wmsList, setWmsList] = useState<{ id: string; wms_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWms = async () => {
      const { data } = await (supabase.from('wms_master') as any).select('id, wms_name').order('wms_name');
      if (data) setWmsList(data);
    };
    fetchWms();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase
        .from('wms_csv_master') as any)
        .insert([{
          wms_id: formData.wms_id,
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
        }]);
      if (insertError) throw insertError;
      router.push('/wms-csv-master');
      router.refresh();
    } catch (err) {
      console.error('Error creating:', err);
      setError('WMS CSVマスタの登録に失敗しました。このWMSには既に設定が存在する可能性があります。');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/wms-csv-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">WMS CSVマスタ新規登録</h1>
        <p className="text-gray-600 mt-2">WMSの出荷実績CSVフォーマット（列位置）を設定します</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">対象WMS</h2>
          <div>
            <label htmlFor="wms_id" className="block text-sm font-medium text-gray-700 mb-2">
              WMS <span className="text-red-500">*</span>
            </label>
            <select id="wms_id" required value={formData.wms_id}
              onChange={(e) => setFormData({ ...formData, wms_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">選択してください</option>
              {wmsList.map((w) => (
                <option key={w.id} value={w.id}>{w.wms_name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">1WMSにつき1つのCSV設定を登録できます</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">必須列設定</h2>
          <p className="text-sm text-gray-500">CSVの列位置をアルファベットで指定します（例: A, B, C ...）</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="order_number_column" className="block text-sm font-medium text-gray-700 mb-2">
                受注番号列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="order_number_column" required value={formData.order_number_column}
                onChange={(e) => setFormData({ ...formData, order_number_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: A" maxLength={10} />
            </div>
            <div>
              <label htmlFor="product_code_column" className="block text-sm font-medium text-gray-700 mb-2">
                商品コード列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="product_code_column" required value={formData.product_code_column}
                onChange={(e) => setFormData({ ...formData, product_code_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: B" maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipment_quantity_column" className="block text-sm font-medium text-gray-700 mb-2">
                出荷数列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="shipment_quantity_column" required value={formData.shipment_quantity_column}
                onChange={(e) => setFormData({ ...formData, shipment_quantity_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: C" maxLength={10} />
            </div>
            <div>
              <label htmlFor="unit_price_column" className="block text-sm font-medium text-gray-700 mb-2">
                販売単価列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="unit_price_column" required value={formData.unit_price_column}
                onChange={(e) => setFormData({ ...formData, unit_price_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: D" maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipment_date_column" className="block text-sm font-medium text-gray-700 mb-2">
                出荷完了日列 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="shipment_date_column" required value={formData.shipment_date_column}
                onChange={(e) => setFormData({ ...formData, shipment_date_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="例: E" maxLength={10} />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
            </div>
            <div>
              <label htmlFor="shipping_fee_target" className="block text-sm font-medium text-gray-700 mb-2">送料の対象項目名</label>
              <input type="text" id="shipping_fee_target" value={formData.shipping_fee_target}
                onChange={(e) => setFormData({ ...formData, shipping_fee_target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="＊=最初の1件のみ" />
            </div>
            <div>
              <label htmlFor="payment_fee_column" className="block text-sm font-medium text-gray-700 mb-2">コンビニ決済手数料列</label>
              <input type="text" id="payment_fee_column" value={formData.payment_fee_column}
                onChange={(e) => setFormData({ ...formData, payment_fee_column: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                maxLength={10} />
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
            <Save className="w-5 h-5" />{loading ? '登録中...' : '登録'}
          </button>
          <Link href="/wms-csv-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
