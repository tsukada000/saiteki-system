'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Warehouse = { id: string; warehouse_name: string; wms_id: string };
type WmsCsvMaster = {
  order_number_column: string;
  product_code_column: string;
  shipment_quantity_column: string;
  unit_price_column: string;
  shipment_date_column: string;
  shipping_fee_column: string | null;
  shipping_fee_target: string | null;
  payment_fee_column: string | null;
  payment_fee_target: string | null;
  cod_fee_column: string | null;
  cod_fee_target: string | null;
};

function columnToIndex(col: string): number {
  let index = 0;
  const upper = col.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export default function ShipmentRecordsImportPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [wmsCsvMaster, setWmsCsvMaster] = useState<WmsCsvMaster | null>(null);
  const [noConfig, setNoConfig] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; error: number; message: string } | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const { data } = await (supabase.from('warehouse_master') as any)
        .select('id, warehouse_name, wms_id')
        .order('warehouse_name');
      if (data) setWarehouses(data);
    };
    fetchWarehouses();
  }, [supabase]);

  useEffect(() => {
    if (!selectedWarehouseId) { setWmsCsvMaster(null); setNoConfig(false); return; }
    const warehouse = warehouses.find(w => w.id === selectedWarehouseId);
    if (!warehouse) return;

    const fetchConfig = async () => {
      const { data } = await (supabase.from('wms_csv_master') as any)
        .select('*')
        .eq('wms_id', warehouse.wms_id)
        .single();
      if (data) {
        setWmsCsvMaster(data);
        setNoConfig(false);
      } else {
        setWmsCsvMaster(null);
        setNoConfig(true);
      }
    };
    fetchConfig();
  }, [selectedWarehouseId, warehouses, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const rows = lines.map(parseCSVLine);
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(f, 'Shift_JIS');
  };

  const handleImport = async () => {
    if (!file || !wmsCsvMaster || !selectedWarehouseId) return;
    setImporting(true);
    setResult(null);

    try {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsText(file, 'Shift_JIS');
      });

      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const rows = lines.map(parseCSVLine);

      const dataRows = rows.slice(1);
      const orderIdx = columnToIndex(wmsCsvMaster.order_number_column);
      const codeIdx = columnToIndex(wmsCsvMaster.product_code_column);
      const qtyIdx = columnToIndex(wmsCsvMaster.shipment_quantity_column);
      const priceIdx = columnToIndex(wmsCsvMaster.unit_price_column);
      const dateIdx = columnToIndex(wmsCsvMaster.shipment_date_column);
      const shipFeeIdx = wmsCsvMaster.shipping_fee_column ? columnToIndex(wmsCsvMaster.shipping_fee_column) : -1;
      const payFeeIdx = wmsCsvMaster.payment_fee_column ? columnToIndex(wmsCsvMaster.payment_fee_column) : -1;
      const codFeeIdx = wmsCsvMaster.cod_fee_column ? columnToIndex(wmsCsvMaster.cod_fee_column) : -1;

      const shipFeeTarget = wmsCsvMaster.shipping_fee_target || null;
      const payFeeTarget = wmsCsvMaster.payment_fee_target || null;
      const codFeeTarget = wmsCsvMaster.cod_fee_target || null;

      const orderFirstSeen = new Set<string>();
      let successCount = 0;
      let errorCount = 0;
      const records: any[] = [];

      for (const row of dataRows) {
        const orderNumber = row[orderIdx]?.trim();
        if (!orderNumber) continue;

        const productCode = row[codeIdx]?.trim() || null;
        const quantity = parseInt(row[qtyIdx]?.replace(/,/g, '') || '0', 10) || 0;
        const unitPrice = parseFloat(row[priceIdx]?.replace(/,/g, '') || '0') || 0;
        const totalAmount = quantity * unitPrice;

        const rawDate = row[dateIdx]?.trim() || '';
        let shipmentDate = rawDate;
        if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(rawDate)) {
          shipmentDate = rawDate.replace(/\//g, '-');
        } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
          const parts = rawDate.split('/');
          shipmentDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }

        const isFirstForOrder = !orderFirstSeen.has(orderNumber);
        orderFirstSeen.add(orderNumber);

        let shippingFee = 0;
        if (shipFeeIdx >= 0 && row[shipFeeIdx]) {
          if (!shipFeeTarget || isFirstForOrder) {
            shippingFee = parseFloat(row[shipFeeIdx].replace(/,/g, '') || '0') || 0;
          }
        }

        let paymentFee = 0;
        if (payFeeIdx >= 0 && row[payFeeIdx]) {
          if (!payFeeTarget || isFirstForOrder) {
            paymentFee = parseFloat(row[payFeeIdx].replace(/,/g, '') || '0') || 0;
          }
        }

        let codFee = 0;
        if (codFeeIdx >= 0 && row[codFeeIdx]) {
          if (!codFeeTarget || isFirstForOrder) {
            codFee = parseFloat(row[codFeeIdx].replace(/,/g, '') || '0') || 0;
          }
        }

        records.push({
          warehouse_id: selectedWarehouseId,
          order_number: orderNumber,
          product_code: productCode,
          purchase_quantity: quantity,
          total_amount: totalAmount,
          shipping_fee: shippingFee,
          payment_fee: paymentFee,
          cod_fee: codFee,
          shipment_date: shipmentDate,
        });
      }

      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100);
        const { error } = await (supabase.from('shipment_records') as any).insert(batch);
        if (error) {
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      setResult({
        success: successCount,
        error: errorCount,
        message: `取込完了: ${successCount}件成功${errorCount > 0 ? `、${errorCount}件エラー` : ''}`,
      });
    } catch (err) {
      console.error('Import error:', err);
      setResult({ success: 0, error: 1, message: 'CSV取込中にエラーが発生しました' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/shipment-records" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />出荷実績一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">WMS出荷実績取込</h1>
        <p className="text-gray-600 mt-2">WMS CSVマスタの設定に従い、出荷実績CSVから出荷データを一括登録します</p>
      </div>

      {/* Step 1: 倉庫選択 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">1. 倉庫を選択</h2>
        <select value={selectedWarehouseId}
          onChange={(e) => { setSelectedWarehouseId(e.target.value); setFile(null); setPreview([]); setResult(null); }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">選択してください</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.warehouse_name}</option>
          ))}
        </select>

        {noConfig && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            この倉庫のWMSにCSVマスタが設定されていません。先にWMS CSVマスタを登録してください。
          </div>
        )}

        {wmsCsvMaster && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">CSV列設定:</p>
            <div className="flex flex-wrap gap-3">
              <span>受注番号: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.order_number_column}</code></span>
              <span>商品コード: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.product_code_column}</code></span>
              <span>出荷数: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.shipment_quantity_column}</code></span>
              <span>単価: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.unit_price_column}</code></span>
              <span>出荷日: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.shipment_date_column}</code></span>
              {wmsCsvMaster.shipping_fee_column && <span>送料: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.shipping_fee_column}</code></span>}
              {wmsCsvMaster.payment_fee_column && <span>決済手数料: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.payment_fee_column}</code></span>}
              {wmsCsvMaster.cod_fee_column && <span>引取手数料: <code className="font-mono bg-blue-100 px-1 rounded">{wmsCsvMaster.cod_fee_column}</code></span>}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: ファイル選択 */}
      {wmsCsvMaster && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">2. CSVファイルを選択</h2>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
              <FileSpreadsheet className="w-5 h-5" />ファイルを選択
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            {file && <span className="text-sm text-gray-600">{file.name}</span>}
          </div>
          <p className="text-sm text-gray-500">WMS出荷実績CSVファイル（Shift_JIS / UTF-8）を選択してください。1行目はヘッダーとして扱います。</p>

          {preview.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">行</th>
                    {preview[0].map((_, i) => (
                      <th key={i} className="px-3 py-2 text-left text-gray-500 font-mono">
                        {String.fromCharCode(65 + i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? 'bg-yellow-50 font-semibold' : ''}>
                      <td className="px-3 py-1.5 text-gray-400">{ri === 0 ? 'ヘッダー' : ri}</td>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-gray-700 max-w-[150px] truncate">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Step 3: 取込実行 */}
      {file && wmsCsvMaster && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">3. 取込実行</h2>
          <p className="text-sm text-gray-500">
            出荷実績データを一括登録します。同一データの重複チェックは行いません（追加登録方式）。
          </p>
          <button type="button" onClick={handleImport} disabled={importing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-5 h-5" />{importing ? '取込中...' : '取込開始'}
          </button>

          {result && (
            <div className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
              result.error > 0
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {result.error > 0 ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
