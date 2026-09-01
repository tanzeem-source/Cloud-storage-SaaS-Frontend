'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { FileItem, FolderItem, BreadcrumbEntry } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/format';
import Breadcrumbs from '@/components/BreadcrumbsTemp';
import { FolderIcon, FileIcon } from '@/components/Icons';

export default function DashboardPage() {
  const [trail, setTrail] = useState<BreadcrumbEntry[]>([{ id: 'root', name: 'My Drive' }]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentFolderId = trail[trail.length - 1].id;

  const loadContents = useCallback(async (folderId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/folders/${folderId}`);
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents(currentFolderId);
  }, [currentFolderId, loadContents]);

  function openFolder(folder: FolderItem) {
    setTrail((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function navigateToBreadcrumb(index: number) {
    setTrail((prev) => prev.slice(0, index + 1));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Drive</h1>
        </div>

        <Breadcrumbs trail={trail} onNavigate={navigateToBreadcrumb} />

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm py-12 text-center">Loading...</div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="text-gray-500 text-sm py-12 text-center">
            This folder is empty.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => openFolder(folder)}
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition text-center"
              >
                <FolderIcon />
                <span className="mt-2 text-sm font-medium text-gray-800 truncate w-full">
                  {folder.name}
                </span>
              </button>
            ))}

            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition text-center"
              >
                <FileIcon />
                <span className="mt-2 text-sm font-medium text-gray-800 truncate w-full">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}