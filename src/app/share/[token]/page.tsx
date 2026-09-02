'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/format';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);

  async function openLink(withPassword?: string) {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/shares/link/${token}`, {
        method: 'POST',
        body: JSON.stringify(withPassword ? { password: withPassword } : {}),
      });
      setResult(data);
      setNeedsPassword(false);
    } catch (err: any) {
      if (err.message.includes('Password') || err.message.includes('password')) {
        setNeedsPassword(true);
      } else if (err.message.includes('Not authenticated')) {
        router.push(`/login?redirect=/share/${token}`);
        return;
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    openLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    openLink(password);
  }

  const file = result?.file;
  const downloadUrl = result?.downloadUrl;
  const isImage = file?.mime_type?.startsWith('image/');
  const isPdf = file?.mime_type === 'application/pdf';
  const isVideo = file?.mime_type?.startsWith('video/');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        {loading && <p className="text-center text-gray-500 text-sm">Loading...</p>}

        {!loading && needsPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h1 className="text-lg font-medium">This link is password protected</h1>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Unlock
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}

        {!loading && !needsPassword && error && (
          <div className="text-center py-8">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !needsPassword && !error && file && (
          <div>
            <h1 className="text-lg font-medium mb-1 truncate">{file.name}</h1>
            <p className="text-xs text-gray-400 mb-4">
              {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
            </p>

            {isImage && (
              <img src={downloadUrl} alt={file.name} className="max-w-full mx-auto rounded mb-4" />
            )}
            {isPdf && (
              <iframe src={downloadUrl} className="w-full h-[60vh] border rounded mb-4" />
            )}
            {isVideo && (
              <video src={downloadUrl} controls className="w-full max-h-[60vh] rounded mb-4" />
            )}
            {!isImage && !isPdf && !isVideo && (
              <div className="text-center py-6 text-gray-500 text-sm mb-4">
                No inline preview available for this file type.
              </div>
            )}

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Download
            </a>
          </div>
        )}

        {!loading && !needsPassword && !error && result?.files && (
          <div>
            <h1 className="text-lg font-medium mb-4">Shared folder</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {result.files.map((f: any) => (
                <div key={f.id} className="p-3 border border-gray-200 rounded text-sm text-center truncate">
                  {f.name}
                </div>
              ))}
              {result.files.length === 0 && (
                <p className="text-sm text-gray-400 col-span-full text-center">This folder is empty.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}