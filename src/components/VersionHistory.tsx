'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { uploadFileWithProgress } from '@/lib/upload';
import { useToast } from '@/components/Toast';
import { formatBytes, formatDate } from '@/lib/format';

interface Props {
  fileId: string;
  fileName: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function VersionHistory({ fileId, fileName, onClose, onUpdated }: Props) {
  const { showToast } = useToast();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/files/${fileId}/versions`);
      setVersions(data.versions || []);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  async function handleNewVersion(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFileWithProgress(file, null, () => {});
      showToast('New version uploaded', 'success');
      load();
      onUpdated();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRestore(versionId: string) {
    try {
      await apiFetch(`/api/files/${fileId}/versions/${versionId}/restore`, { method: 'POST' });
      showToast('Version restored', 'success');
      load();
      onUpdated();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium truncate">Version history — {fileName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 px-2">✕</button>
        </div>

        <label className="inline-block mb-4 px-3 py-2 bg-blue-600 text-white text-sm rounded-md cursor-pointer hover:bg-blue-700">
          {uploading ? 'Uploading...' : 'Upload new version'}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleNewVersion} disabled={uploading} />
        </label>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">v{v.version_number}</span>{' '}
                  <span className="text-gray-500">
                    {formatBytes(v.size_bytes)} · {formatDate(v.created_at)}
                  </span>
                </div>
                <button onClick={() => handleRestore(v.id)} className="text-xs text-blue-600 hover:underline">
                  Restore this version
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}