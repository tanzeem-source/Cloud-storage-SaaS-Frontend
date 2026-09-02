'use client';

import { useState, useCallback, DragEvent } from 'react';
import { uploadFileWithProgress } from '@/lib/upload';
import { useToast } from '@/components/Toast';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

interface Props {
  folderId: string | null;
  onUploaded: () => void; // trigger a refetch of folder contents
}

export default function UploadZone({ folderId, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const { showToast } = useToast();

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList);

      for (const file of files) {
        const uploadId = `${file.name}-${Date.now()}`;
        setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0, status: 'uploading' }]);

        try {
          await uploadFileWithProgress(file, folderId, (percent) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadId ? { ...u, progress: percent } : u))
            );
          });
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'done', progress: 100 } : u))
          );
          showToast(`${file.name} uploaded successfully`, 'success');
          onUploaded();
        } catch (err: any) {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
          );
          showToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
        }

        // Clean up completed/errored entries after a delay
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.id !== uploadId));
        }, 3000);
      }
    },
    [folderId, onUploaded, showToast]
  );

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // allow re-selecting the same file later
    }
  }

  return (
    <div className="mb-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <p className="text-gray-500 text-sm mb-2">Drag & drop files here, or</p>
        <label className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md cursor-pointer hover:bg-blue-700">
          Browse files
          <input type="file" multiple className="hidden" onChange={onFileInputChange} />
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-md p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate">{u.name}</span>
                <span className="text-gray-500">
                  {u.status === 'error' ? 'Failed' : `${u.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    u.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}