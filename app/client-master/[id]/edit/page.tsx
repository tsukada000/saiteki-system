'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';

type ContactForm = {
  id?: string;
  contact_name: string;
  email: string;
  phone_number: string;
  send_invoice: boolean;
};

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [formData, setFormData] = useState({
    client_name: '',
    client_number: '',
    is_active: true,
    postal_code: '',
    address1: '',
    address2: '',
    bank_name: '',
    branch_name: '',
    account_type: '',
    account_number: '',
    account_holder: '',
    storage_fee: 0,
    operation_fixed_cost: 0,
    remarks: '',
  });

  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientResult, contactsResult] = await Promise.all([
          (supabase.from('client_master') as any).select('*').eq('id', id).single(),
          (supabase.from('client_contacts') as any).select('*').eq('client_id', id).order('created_at'),
        ]);

        if (clientResult.error) throw clientResult.error;
        if (clientResult.data) {
          const d = clientResult.data;
          setFormData({
            client_name: d.client_name,
            client_number: d.client_number,
            is_active: d.is_active,
            postal_code: d.postal_code || '',
            address1: d.address1 || '',
            address2: d.address2 || '',
            bank_name: d.bank_name || '',
            branch_name: d.branch_name || '',
            account_type: d.account_type || '',
            account_number: d.account_number || '',
            account_holder: d.account_holder || '',
            storage_fee: Number(d.storage_fee) || 0,
            operation_fixed_cost: Number(d.operation_fixed_cost) || 0,
            remarks: d.remarks || '',
          });
        }

        if (contactsResult.data) {
          setContacts(contactsResult.data.map((c: any) => ({
            id: c.id,
            contact_name: c.contact_name,
            email: c.email || '',
            phone_number: c.phone_number || '',
            send_invoice: c.send_invoice,
          })));
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

  const addContact = () => {
    setContacts([...contacts, { contact_name: '', email: '', phone_number: '', send_invoice: false }]);
  };

  const removeContact = (index: number) => {
    const contact = contacts[index];
    if (contact.id) {
      setDeletedContactIds([...deletedContactIds, contact.id]);
    }
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof ContactForm, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // クライアント情報を更新
      const { error: updateError } = await (supabase
        .from('client_master') as any)
        .update({
          client_name: formData.client_name,
          is_active: formData.is_active,
          postal_code: formData.postal_code.trim() || null,
          address1: formData.address1.trim() || null,
          address2: formData.address2.trim() || null,
          bank_name: formData.bank_name.trim() || null,
          branch_name: formData.branch_name.trim() || null,
          account_type: formData.account_type || null,
          account_number: formData.account_number.trim() || null,
          account_holder: formData.account_holder.trim() || null,
          storage_fee: formData.storage_fee,
          operation_fixed_cost: formData.operation_fixed_cost,
          remarks: formData.remarks.trim() || null,
        })
        .eq('id', id);
      if (updateError) throw updateError;

      // 削除された担当者を削除
      if (deletedContactIds.length > 0) {
        const { error: deleteError } = await (supabase
          .from('client_contacts') as any)
          .delete()
          .in('id', deletedContactIds);
        if (deleteError) throw deleteError;
      }

      // 既存の担当者を更新、新規の担当者を追加
      for (const contact of contacts) {
        if (!contact.contact_name.trim()) continue;

        const contactData = {
          contact_name: contact.contact_name,
          email: contact.email.trim() || null,
          phone_number: contact.phone_number.trim() || null,
          send_invoice: contact.send_invoice,
        };

        if (contact.id) {
          const { error: cError } = await (supabase
            .from('client_contacts') as any)
            .update(contactData)
            .eq('id', contact.id);
          if (cError) throw cError;
        } else {
          const { error: cError } = await (supabase
            .from('client_contacts') as any)
            .insert([{ ...contactData, client_id: id }]);
          if (cError) throw cError;
        }
      }

      router.push('/client-master');
      router.refresh();
    } catch (err) {
      console.error('Error updating:', err);
      setError('クライアントの更新に失敗しました');
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
        <Link href="/client-master" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">クライアント編集</h1>
        <p className="text-gray-600 mt-2">
          クライアント番号: <span className="font-mono font-semibold">{formData.client_number}</span>
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">基本情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                クライアント名 <span className="text-red-500">*</span>
              </label>
              <input type="text" id="client_name" required value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">有効</span>
              </label>
            </div>
          </div>
        </div>

        {/* 住所情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">住所情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">郵便番号</label>
              <input type="text" id="postal_code" value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">住所①</label>
            <input type="text" id="address1" value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">住所②</label>
            <input type="text" id="address2" value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        {/* 銀行情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">振込先口座情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">金融機関名</label>
              <input type="text" id="bank_name" value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700 mb-2">支店名</label>
              <input type="text" id="branch_name" value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-2">口座種別</label>
              <select id="account_type" value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">選択してください</option>
                <option value="普通">普通</option>
                <option value="当座">当座</option>
              </select>
            </div>
            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">口座番号</label>
              <input type="text" id="account_number" value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="account_holder" className="block text-sm font-medium text-gray-700 mb-2">口座名義</label>
              <input type="text" id="account_holder" value={formData.account_holder}
                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* 費用情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">費用情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storage_fee" className="block text-sm font-medium text-gray-700 mb-2">保管費（税込）</label>
              <div className="relative">
                <input type="number" id="storage_fee" min="0" step="1" value={formData.storage_fee}
                  onChange={(e) => setFormData({ ...formData, storage_fee: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">円</span>
              </div>
            </div>
            <div>
              <label htmlFor="operation_fixed_cost" className="block text-sm font-medium text-gray-700 mb-2">運営固定費（税込）</label>
              <div className="relative">
                <input type="number" id="operation_fixed_cost" min="0" step="1" value={formData.operation_fixed_cost}
                  onChange={(e) => setFormData({ ...formData, operation_fixed_cost: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">円</span>
              </div>
            </div>
          </div>
        </div>

        {/* 担当者情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">担当者情報</h2>
            <button type="button" onClick={addContact}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />担当者追加
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500">担当者が登録されていません。「担当者追加」ボタンから追加してください。</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={contact.id || `new-${index}`} className="border border-gray-200 rounded-lg p-4 space-y-4 relative">
                  <button type="button" onClick={() => removeContact(index)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors" title="削除">
                    <X className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        担当者名 <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required value={contact.contact_name}
                        onChange={(e) => updateContact(index, 'contact_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                      <input type="email" value={contact.email}
                        onChange={(e) => updateContact(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <input type="tel" value={contact.phone_number}
                        onChange={(e) => updateContact(index, 'phone_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    </div>
                  </div>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={contact.send_invoice}
                      onChange={(e) => updateContact(index, 'send_invoice', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">請求書送付対象</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 備考 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">その他</h2>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">備考</label>
            <textarea id="remarks" rows={4} value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />{loading ? '更新中...' : '更新'}
          </button>
          <Link href="/client-master" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}
