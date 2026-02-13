'use client';

import { useState, useEffect, Fragment } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, TrendingUp, Truck, Receipt, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

type Warehouse = { id: string; warehouse_name: string };
type ProductMaster = { product_code: string; ec_site_id: string; project_id: string | null };
type ProjectMaster = { id: string; project_number: string; project_name: string; client_id: string; sales_commission_rate: number };
type ClientMaster = { id: string; client_number: string; client_name: string };
type ShipmentRecord = {
  id: string;
  warehouse_id: string;
  order_number: string;
  product_code: string | null;
  purchase_quantity: number;
  total_amount: number;
  shipping_fee: number;
  cod_fee: number;
  payment_fee: number;
  shipment_date: string;
};

type ProjectSummary = {
  projectId: string | null;
  projectName: string;
  clientId: string | null;
  clientName: string;
  totalAmount: number;
  shippingFee: number;
  codFee: number;
  paymentFee: number;
  shipmentCount: number;
};

export default function SalesReportPage() {
  const supabase = createClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [warehouseId, setWarehouseId] = useState('');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);
  const [showDetail, setShowDetail] = useState(false);

  // Fetch warehouses for filter
  useEffect(() => {
    const fetchWarehouses = async () => {
      const { data } = await (supabase.from('warehouse_master') as any)
        .select('id, warehouse_name')
        .order('warehouse_name');
      if (data) setWarehouses(data);
    };
    fetchWarehouses();
  }, [supabase]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setShowDetail(false);

    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      // 1. Fetch shipment records
      let query = (supabase.from('shipment_records') as any)
        .select('*')
        .gte('shipment_date', startDate)
        .lt('shipment_date', endDate)
        .order('shipment_date', { ascending: true });

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }

      const { data: shipmentData } = await query;
      const records: ShipmentRecord[] = shipmentData || [];
      setShipments(records);

      if (records.length === 0) {
        setProjectSummaries([]);
        setLoading(false);
        return;
      }

      // 2. Fetch master data in parallel
      const [productsRes, projectsRes, clientsRes] = await Promise.all([
        (supabase.from('product_master') as any).select('product_code, ec_site_id, project_id'),
        (supabase.from('project_master') as any).select('id, project_number, project_name, client_id, sales_commission_rate'),
        (supabase.from('client_master') as any).select('id, client_number, client_name'),
      ]);

      const products: ProductMaster[] = productsRes.data || [];
      const projects: ProjectMaster[] = projectsRes.data || [];
      const clients: ClientMaster[] = clientsRes.data || [];

      // Build lookup maps
      const productByCode = new Map<string, ProductMaster>();
      for (const p of products) {
        if (!productByCode.has(p.product_code)) {
          productByCode.set(p.product_code, p);
        }
      }

      const projectById = new Map<string, ProjectMaster>();
      for (const p of projects) {
        projectById.set(p.id, p);
      }

      const clientById = new Map<string, ClientMaster>();
      for (const c of clients) {
        clientById.set(c.id, c);
      }

      // 3. Aggregate by project
      const summaryMap = new Map<string, ProjectSummary>();

      for (const rec of records) {
        let projectId: string | null = null;
        let projectName = '未紐付け';
        let clientId: string | null = null;
        let clientName = '未紐付け';

        if (rec.product_code) {
          const product = productByCode.get(rec.product_code);
          if (product?.project_id) {
            const project = projectById.get(product.project_id);
            if (project) {
              projectId = project.id;
              projectName = `${project.project_number} ${project.project_name}`;
              clientId = project.client_id;
              const client = clientById.get(project.client_id);
              clientName = client ? `${client.client_number} ${client.client_name}` : '不明';
            }
          }
        }

        const key = projectId || '__unlinked__';
        const existing = summaryMap.get(key);
        if (existing) {
          existing.totalAmount += rec.total_amount;
          existing.shippingFee += rec.shipping_fee;
          existing.codFee += rec.cod_fee;
          existing.paymentFee += rec.payment_fee;
          existing.shipmentCount += 1;
        } else {
          summaryMap.set(key, {
            projectId,
            projectName,
            clientId,
            clientName,
            totalAmount: rec.total_amount,
            shippingFee: rec.shipping_fee,
            codFee: rec.cod_fee,
            paymentFee: rec.payment_fee,
            shipmentCount: 1,
          });
        }
      }

      // Sort: by clientName then projectName, "未紐付け" last
      const summaries = Array.from(summaryMap.values()).sort((a, b) => {
        if (!a.projectId && b.projectId) return 1;
        if (a.projectId && !b.projectId) return -1;
        const cmp = a.clientName.localeCompare(b.clientName, 'ja');
        if (cmp !== 0) return cmp;
        return a.projectName.localeCompare(b.projectName, 'ja');
      });

      setProjectSummaries(summaries);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute totals
  const totalAmount = projectSummaries.reduce((s, p) => s + p.totalAmount, 0);
  const totalFees = projectSummaries.reduce((s, p) => s + p.shippingFee + p.codFee + p.paymentFee, 0);
  const totalShipments = shipments.length;
  const totalOrders = new Set(shipments.map(s => s.order_number)).size;

  // Group summaries by client for subtotals
  const clientGroups = new Map<string, ProjectSummary[]>();
  for (const s of projectSummaries) {
    const key = s.clientId || '__unlinked__';
    const group = clientGroups.get(key) || [];
    group.push(s);
    clientGroups.set(key, group);
  }

  // Year options: current year +/- 2
  const yearOptions = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">売上報告</h1>
        <p className="text-gray-600 mt-2">出荷実績データを集計し、案件別・クライアント別の売上レポートを表示します</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象年</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {yearOptions.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象月</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">倉庫</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">すべて</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
            </select>
          </div>
          <button type="button" onClick={handleSearch} disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Search className="w-5 h-5" />{loading ? '集計中...' : '検索'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">売上合計</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalAmount.toLocaleString()}円</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">手数料合計</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalFees.toLocaleString()}円</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">出荷件数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalShipments.toLocaleString()}件</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">受注件数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders.toLocaleString()}件</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Project Summary Table */}
          {shipments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">案件別集計</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クライアント</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">売上合計</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">送料</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">決済手数料</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">引取手数料</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">出荷数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from(clientGroups.entries()).map(([clientKey, items]) => {
                      const clientSubTotal = items.reduce((s, i) => s + i.totalAmount, 0);
                      const clientShipFee = items.reduce((s, i) => s + i.shippingFee, 0);
                      const clientPayFee = items.reduce((s, i) => s + i.paymentFee, 0);
                      const clientCodFee = items.reduce((s, i) => s + i.codFee, 0);
                      const clientShipCount = items.reduce((s, i) => s + i.shipmentCount, 0);
                      const showSubtotal = items.length > 1;

                      return (
                        <Fragment key={clientKey}>
                          {items.map((item, idx) => (
                            <tr key={item.projectId || `unlinked-${idx}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {idx === 0 ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${item.clientId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {item.clientName}
                                  </span>
                                ) : ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.projectName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">{item.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{item.shippingFee.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{item.paymentFee.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{item.codFee.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{item.shipmentCount.toLocaleString()}</td>
                            </tr>
                          ))}
                          {showSubtotal && (
                            <tr className="bg-gray-50 font-semibold">
                              <td className="px-6 py-2 text-sm text-gray-700">小計</td>
                              <td className="px-6 py-2"></td>
                              <td className="px-6 py-2 text-sm text-gray-900 text-right font-mono">{clientSubTotal.toLocaleString()}</td>
                              <td className="px-6 py-2 text-sm text-gray-700 text-right font-mono">{clientShipFee.toLocaleString()}</td>
                              <td className="px-6 py-2 text-sm text-gray-700 text-right font-mono">{clientPayFee.toLocaleString()}</td>
                              <td className="px-6 py-2 text-sm text-gray-700 text-right font-mono">{clientCodFee.toLocaleString()}</td>
                              <td className="px-6 py-2 text-sm text-gray-700 text-right">{clientShipCount.toLocaleString()}</td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                    {/* Grand Total */}
                    <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                      <td className="px-6 py-3 text-sm text-blue-900">合計</td>
                      <td className="px-6 py-3"></td>
                      <td className="px-6 py-3 text-sm text-blue-900 text-right font-mono">{totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-blue-800 text-right font-mono">
                        {projectSummaries.reduce((s, p) => s + p.shippingFee, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-blue-800 text-right font-mono">
                        {projectSummaries.reduce((s, p) => s + p.paymentFee, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-blue-800 text-right font-mono">
                        {projectSummaries.reduce((s, p) => s + p.codFee, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-blue-800 text-right">
                        {totalShipments.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">{year}年{month}月の出荷実績データがありません</p>
              <p className="text-sm mt-2">WMS出荷実績取込からデータを登録してください</p>
            </div>
          )}

          {/* Detail Toggle */}
          {shipments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setShowDetail(!showDetail)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <h2 className="text-lg font-semibold text-gray-900">明細一覧（{shipments.length}件）</h2>
                {showDetail ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {showDetail && (
                <div className="overflow-x-auto border-t border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">出荷日</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">受注番号</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品コード</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">数量</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">送料</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">決済</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">引取</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {shipments.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{s.shipment_date}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-900">{s.order_number}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-600">{s.product_code || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{s.purchase_quantity.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-mono">{s.total_amount.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{s.shipping_fee.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{s.payment_fee.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{s.cod_fee.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
