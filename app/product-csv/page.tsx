'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

type EcSite = { id: string; ec_site_name: string; cart_id: string };
type CsvMaster = {
  product_code_column: string;
  product_name_column: string | null;
  unit_price_column: string | null;
  project_name_column: string | null;
  category_column: string | null;
  variation_column: string | null;
};

function columnToIndex(col: string): number {
  let index = 0;
  const upper = col.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

export default function ProductCsvPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [ecSites, setEcSites] = useState<EcSite[]>([]);
  const [selectedEcSiteId, setSelectedEcSiteId] = useState('');
  const [csvMaster, setCsvMaster] = useState<CsvMaster | null>(null);
  const [noConfig, setNoConfig] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; error: number; message: string } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from('ec_site_master') as any)
        .select('id, ec_site_name, cart_id')
        .order('ec_site_name');
      if (data) setEcSites(data);
    };
    fetch();
  }, [supabase]);

  useEffect(() => {
    if (!selectedEcSiteId) { setCsvMaster(null); setNoConfig(false); return; }
    const ecSite = ecSites.find(e => e.id === selectedEcSiteId);
    if (!ecSite) return;

    const fetchConfig = async () => {
      const { data } = await (supabase.from('product_csv_master') as any)
        .select('*')
        .eq('cart_id', ecSite.cart_id)
        .single();
      if (data) {
        setCsvMaster(data);
        setNoConfig(false);
      } else {
        setCsvMaster(null);
        setNoConfig(true);
      }
    };
    fetchConfig();
  }, [selectedEcSiteId, ecSites, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const rows = lines.map(line => {
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
      });
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(f, 'Shift_JIS');
  };

  const handleImport = async () => {
    if (!file || !csvMaster || !selectedEcSiteId) return;
    setImporting(true);
    setResult(null);

    try {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsText(file, 'Shift_JIS');
      });

      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const rows = lines.map(line => {
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
      });

      // Skip header row
      const dataRows = rows.slice(1);
      const codeIdx = columnToIndex(csvMaster.product_code_column);
      const nameIdx = csvMaster.product_name_column ? columnToIndex(csvMaster.product_name_column) : -1;
      const priceIdx = csvMaster.unit_price_column ? columnToIndex(csvMaster.unit_price_column) : -1;
      const catIdx = csvMaster.category_column ? columnToIndex(csvMaster.category_column) : -1;
      const varIdx = csvMaster.variation_column ? columnToIndex(csvMaster.variation_column) : -1;

      let successCount = 0;
      let errorCount = 0;

      for (const row of dataRows) {
        const productCode = row[codeIdx]?.trim();
        if (!productCode) continue;

        const record: any = {
          ec_site_id: selectedEcSiteId,
          product_code: productCode,
        };
        if (nameIdx >= 0 && row[nameIdx]) record.product_name = row[nameIdx].trim();
        if (priceIdx >= 0 && row[priceIdx]) record.unit_price = parseFloat(row[priceIdx].replace(/,/g, '')) || 0;
        if (catIdx >= 0 && row[catIdx]) record.category = row[catIdx].trim();
        if (varIdx >= 0 && row[varIdx]) record.variation = row[varIdx].trim();

        // Upsert: check if exists
        const { data: existing } = await (supabase.from('product_master') as any)
          .select('id')
          .eq('ec_site_id', selectedEcSiteId)
          .eq('product_code', productCode)
          .single();

        if (existing) {
          const { error } = await (supabase.from('product_master') as any)
            .update(record)
            .eq('id', existing.id);
          if (error) { errorCount++; } else { successCount++; }
        } else {
          const { error } = await (supabase.from('product_master') as any)
            .insert([record]);
          if (error) { errorCount++; } else { successCount++; }
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
        <h1 className="text-3xl font-bold text-gray-900">商品CSV取込</h1>
        <p className="text-gray-600 mt-2">商品CSVマスタの設定に従い、CSVファイルから商品データを一括登録・更新します</p>
      </div>

      {/* Step 1: ECサイト選択 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">1. ECサイトを選択</h2>
        <select value={selectedEcSiteId}
          onChange={(e) => { setSelectedEcSiteId(e.target.value); setFile(null); setPreview([]); setResult(null); }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">選択してください</option>
          {ecSites.map(s => (
            <option key={s.id} value={s.id}>{s.ec_site_name}</option>
          ))}
        </select>

        {noConfig && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            このECサイトのカートに商品CSVマスタが設定されていません。先に商品CSVマスタを登録してください。
          </div>
        )}

        {csvMaster && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">CSV列設定:</p>
            <div className="flex flex-wrap gap-3">
              <span>商品コード: <code className="font-mono bg-blue-100 px-1 rounded">{csvMaster.product_code_column}</code></span>
              {csvMaster.product_name_column && <span>商品名: <code className="font-mono bg-blue-100 px-1 rounded">{csvMaster.product_name_column}</code></span>}
              {csvMaster.unit_price_column && <span>単価: <code className="font-mono bg-blue-100 px-1 rounded">{csvMaster.unit_price_column}</code></span>}
              {csvMaster.category_column && <span>カテゴリ: <code className="font-mono bg-blue-100 px-1 rounded">{csvMaster.category_column}</code></span>}
              {csvMaster.variation_column && <span>バリエーション: <code className="font-mono bg-blue-100 px-1 rounded">{csvMaster.variation_column}</code></span>}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: ファイル選択 */}
      {csvMaster && (
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
          <p className="text-sm text-gray-500">CSVファイル（Shift_JIS / UTF-8）を選択してください。1行目はヘッダーとして扱います。</p>

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
      {file && csvMaster && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">3. 取込実行</h2>
          <p className="text-sm text-gray-500">
            同一ECサイト・商品コードのデータが既に存在する場合は上書き更新されます。
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
