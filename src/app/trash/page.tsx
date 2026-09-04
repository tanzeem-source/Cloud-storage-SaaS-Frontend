'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { formatBytes, formatDate } from '@/lib/format';
import { FolderIcon, FileIcon } from '@/components/Icons';

export default function TrashPage() {
  const { showToast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/files/trash');
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function restoreFile(id: string) {
    try {
      await apiFetch(`/api/files/${id}/restore`, { method: 'PATCH' });
      showToast('File restored', 'success');
      load();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  async function restoreFolder(id: string) {
    try {
      await apiFetch(`/api/folders/${id}/restore`, { method: 'PATCH' });
      showToast('Folder restored', 'success');
      load();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  async function permanentlyDelete(id: string) {
    if (!confirm('Permanently delete this file? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/files/${id}/permanent`, { method: 'DELETE' });
      showToast('File permanently deleted', 'success');
      load();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Trash</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to My Drive
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : folders.length === 0 && files.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">Trash is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 text-center">
                <FolderIcon />
                <span className="mt-2 text-sm font-medium text-gray-800 truncate w-full">{folder.name}</span>
                <button
                  onClick={() => restoreFolder(folder.id)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Restore
                </button>
              </div>
            ))}

            {files.map((file) => (
              <div key={file.id} className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 text-center">
                <FileIcon />
                <span className="mt-2 text-sm font-medium text-gray-800 truncate w-full">{file.name}</span>
                <span className="text-xs text-gray-400 mt-1">
                  {formatBytes(file.size_bytes)} · {formatDate(file.updated_at)}
                </span>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => restoreFile(file.id)} className="text-xs text-blue-600 hover:underline">
                    Restore
                  </button>
                  <button onClick={() => permanentlyDelete(file.id)} className="text-xs text-red-600 hover:underline">
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}