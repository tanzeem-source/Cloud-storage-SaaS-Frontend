"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { FileItem, FolderItem, BreadcrumbEntry } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/format";
import Breadcrumbs from "@/components/BreadcrumbsTemp";
import { FolderIcon, FileIcon } from "@/components/Icons";
import UploadZone from "@/components/Uploadzone";
import FilePreview from "@/components/FilePreview";
import ShareModal from "@/components/ShareModal";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [trail, setTrail] = useState<BreadcrumbEntry[]>([
    { id: "root", name: "My Drive" },
  ]);
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareTarget, setShareTarget] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
  } | null>(null);

  const currentFolderId = trail[trail.length - 1].id;

  async function handleLogout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  } catch (err) {
    // even if the API call fails, still redirect — the cookie clearing is best-effort
    router.push("/login");
  }
}

  const loadContents = useCallback(async (folderId: string) => {
    setLoading(true);
    setError("");
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Drive</h1>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Log out
        </button>

        <Breadcrumbs trail={trail} onNavigate={navigateToBreadcrumb} />

        <UploadZone
          folderId={currentFolderId === "root" ? null : currentFolderId}
          onUploaded={() => loadContents(currentFolderId)}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm py-12 text-center">
            Loading...
          </div>
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
              <div key={file.id} className="relative group">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition text-center w-full"
                >
                  <FileIcon />
                  <span className="mt-2 text-sm font-medium text-gray-800 truncate w-full">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatBytes(file.size_bytes)} ·{" "}
                    {formatDate(file.created_at)}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareTarget({
                      type: "file",
                      id: file.id,
                      name: file.name,
                    });
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-1 shadow text-xs"
                  title="Share"
                >
                  🔗
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {shareTarget && (
        <ShareModal
          resourceType={shareTarget.type}
          resourceId={shareTarget.id}
          resourceName={shareTarget.name}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}
