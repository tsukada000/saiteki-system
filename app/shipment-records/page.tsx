import { createClient } from '@/lib/supabase/server';
import { Upload } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './delete-button';

export default async function ShipmentRecordsListPage() {
  const supabase = await createClient();

  const { data: records, error } = await (supabase
    .from('shipment_records') as any)
    .select('*, warehouse_master(warehouse_name)')
    .order('shipment_date', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching shipment records:', error);
  }

  const totalAmount = records?.reduce((s: number, r: any) => s + Number(r.total_amount), 0) || 0;
  const totalCount = records?.length || 0;
  const uniqueOrders = new Set(records?.map((r: any) => r.order_number) || []).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">出荷実績一覧</h1>
          <p className="text-gray-600 mt-2">取り込んだ出荷実績データを確認・管理します</p>
        </div>
        <Link
          href="/shipment-records/import"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          CSV取込
        </Link>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">表示件数</p>
            <p className="text-xl font-bold text-gray-900">{totalCount.toLocaleString()}件</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">受注件数</p>
            <p className="text-xl font-bold text-gray-900">{uniqueOrders.toLocaleString()}件</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">売上合計</p>
            <p className="text-xl font-bold text-gray-900">{totalAmount.toLocaleString()}円</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出荷日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受注番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品コード</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">倉庫</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">送料</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">決済</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">引取</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records && records.length > 0 ? (
                records.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{rec.shipment_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{rec.order_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{rec.product_code || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {rec.warehouse_master?.warehouse_name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">{Number(rec.purchase_quantity).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 text-right">{Number(rec.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 text-right">{Number(rec.shipping_fee).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 text-right">{Number(rec.payment_fee).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 text-right">{Number(rec.cod_fee).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <DeleteButton id={rec.id} label={rec.order_number} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">出荷実績が登録されていません</p>
                    <p className="text-sm mt-2">「CSV取込」ボタンからデータを取り込んでください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {records && records.length > 0 && (
        <div className="text-sm text-gray-600">
          最新 <span className="font-semibold text-gray-900">{records.length}</span> 件を表示（最大200件）
        </div>
      )}
    </div>
  );
}
