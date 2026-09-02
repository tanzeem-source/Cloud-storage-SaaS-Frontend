'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { UserShare, LinkShare } from '@/lib/types';

interface Props {
  resourceType: 'file' | 'folder';
  resourceId: string;
  resourceName: string;
  onClose: () => void;
}

export default function ShareModal({ resourceType, resourceId, resourceName, onClose }: Props) {
  const { showToast } = useToast();
  const [userShares, setUserShares] = useState<UserShare[]>([]);
  const [linkShares, setLinkShares] = useState<LinkShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [sharing, setSharing] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState('24');

  async function loadShares() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/shares/${resourceType}/${resourceId}`);
      setUserShares(data.userShares);
      setLinkShares(data.linkShares);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceType, resourceId]);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setSharing(true);
    try {
      await apiFetch('/api/shares/user', {
        method: 'POST',
        body: JSON.stringify({ resource_type: resourceType, resource_id: resourceId, grantee_email: email, role }),
      });
      showToast(`Shared with ${email}`, 'success');
      setEmail('');
      loadShares();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSharing(false);
    }
  }

  async function handleRoleChange(shareId: string, newRole: 'viewer' | 'editor') {
    try {
      await apiFetch(`/api/shares/user/${shareId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      showToast('Role updated', 'success');
      loadShares();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  async function handleRevoke(shareId: string) {
    try {
      await apiFetch(`/api/shares/user/${shareId}`, { method: 'DELETE' });
      showToast('Access revoked', 'success');
      loadShares();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  async function handleCreateLink() {
    setCreatingLink(true);
    try {
      await apiFetch('/api/shares/link', {
        method: 'POST',
        body: JSON.stringify({
          resource_type: resourceType,
          resource_id: resourceId,
          expires_in_hours: Number(expiresInHours),
        }),
      });
      showToast('Link created', 'success');
      loadShares();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCreatingLink(false);
    }
  }

  async function handleRevokeLink(linkId: string) {
    try {
      await apiFetch(`/api/shares/link/${linkId}`, { method: 'DELETE' });
      showToast('Link revoked', 'success');
      loadShares();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium truncate">Share &quot;{resourceName}&quot;</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 px-2">✕</button>
        </div>

        {/* Share with a specific person */}
        <form onSubmit={handleShare} className="flex gap-2 mb-4">
          <input
            type="email"
            required
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
            className="px-2 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            type="submit"
            disabled={sharing}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Share
          </button>
        </form>

        {/* Existing people with access */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            {userShares.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">People with access</h3>
                <div className="space-y-2">
                  {userShares.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{s.users?.email || s.grantee_user_id}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={s.role}
                          onChange={(e) => handleRoleChange(s.id, e.target.value as 'viewer' | 'editor')}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                        <button
                          onClick={() => handleRevoke(s.id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public share links */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Public links</h3>

              <div className="flex gap-2 mb-3">
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="1">Expires in 1 hour</option>
                  <option value="24">Expires in 24 hours</option>
                  <option value="168">Expires in 7 days</option>
                  <option value="720">Expires in 30 days</option>
                </select>
                <button
                  onClick={handleCreateLink}
                  disabled={creatingLink}
                  className="px-3 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50"
                >
                  Create link
                </button>
              </div>

              <div className="space-y-2">
                {linkShares.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 truncate flex-1">
                      {window.location.origin}/share/{l.token.slice(0, 12)}...
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <button onClick={() => copyLink(l.token)} className="text-blue-600 hover:underline text-xs">
                        Copy
                      </button>
                      <button onClick={() => handleRevokeLink(l.id)} className="text-red-600 hover:underline text-xs">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
                {linkShares.length === 0 && (
                  <p className="text-xs text-gray-400">No public links yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}