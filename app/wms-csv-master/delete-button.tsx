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
    if (!confirm(`「${name}」のWMS CSVマスタを削除しますか？`)) return;

    setLoading(true);
    try {
      const { error } = await (supabase.from('wms_csv_master') as any).delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('削除に失敗しました');
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
