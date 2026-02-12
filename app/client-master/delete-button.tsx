'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${name}」を削除しますか？\n関連する担当者情報も削除されます。`)) return;

    setLoading(true);
    try {
      const { error } = await (supabase.from('client_master') as any).delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('削除に失敗しました。このクライアントに紐づく案件が存在する可能性があります。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="削除">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
