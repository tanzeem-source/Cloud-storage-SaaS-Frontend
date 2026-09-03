"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FileItem, FolderItem, BreadcrumbEntry } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/format";
import Breadcrumbs from "@/components/BreadcrumbsTemp";
import { FolderIcon, FileIcon } from "@/components/Icons";
import UploadZone from "@/components/Uploadzone";
import FilePreview from "@/components/FilePreview";
import ShareModal from "@/components/ShareModal";
import SearchBar from "@/components/SearchBar";
import SortControl from "@/components/SortControl";
import { useDebounce } from "@/hooks/useDebounce";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

export default function DashboardPage() {
  const router = useRouter();
  const [trail, setTrail] = useState<BreadcrumbEntry[]>([
    { id: "root", name: "My Drive" },
  ]);
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

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [filePage, setFilePage] = useState(1);
  const [filePagination, setFilePagination] = useState<any>(null);

  const currentFolderId = trail[trail.length - 1].id;

  const loadContents = useCallback(
    async (folderId: string, page = 1, useCache = true) => {
      const cacheKey = `folder:${folderId}:${sortBy}:${order}:${page}`;
      if (useCache) {
        const cached = getCached(cacheKey);
        if (cached) {
          setFolders(cached.folders);
          setFiles(
            page === 1
              ? cached.files
              : (prev: FileItem[]) => [...prev, ...cached.files],
          );
          setFilePagination(cached.pagination.files);
          setLoading(false);
          return;
        }
      }

      setLoading(page === 1);
      setError("");
      try {
        const params = new URLSearchParams({
          sort: sortBy,
          order,
          filePage: String(page),
          fileLimit: "30",
        });
        const data = await apiFetch(`/api/folders/${folderId}?${params}`);
        setCached(cacheKey, data);
        setFolders(data.folders || []);
        setFiles((prev) =>
          page === 1 ? data.files || [] : [...prev, ...(data.files || [])],
        );
        setFilePagination(data.pagination?.files);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, order],
  );

  // Reset to page 1 whenever folder, sort, or order changes
  useEffect(() => {
    setFilePage(1);
    loadContents(currentFolderId, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, sortBy, order]);

  // Real-time search (debounced)
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    apiFetch(
      `/api/search?q=${encodeURIComponent(debouncedQuery)}&sort=${sortBy}&order=${order}`,
    )
      .then((data) => {
        if (!cancelled) setSearchResults(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, sortBy, order]);

  function loadMoreFiles() {
    const nextPage = filePage + 1;
    setFilePage(nextPage);
    loadContents(currentFolderId, nextPage);
  }

  function openFolder(folder: FolderItem) {
    setTrail((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function navigateToBreadcrumb(index: number) {
    setTrail((prev) => prev.slice(0, index + 1));
  }

  function handleUploaded() {
    invalidateCache(`folder:${currentFolderId}`);
    loadContents(currentFolderId, 1, false);
  }

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  const displayFiles = searchResults !== null ? searchResults : files;
  const isSearchMode = searchResults !== null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Drive</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {!isSearchMode && (
          <Breadcrumbs trail={trail} onNavigate={navigateToBreadcrumb} />
        )}

        {!isSearchMode && (
          <UploadZone
            folderId={currentFolderId === "root" ? null : currentFolderId}
            onUploaded={handleUploaded}
          />
        )}

        <SortControl
          sortBy={sortBy}
          order={order}
          onChange={(s, o) => {
            setSortBy(s);
            setOrder(o);
          }}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        {isSearchMode && (
          <p className="text-xs text-gray-400 mb-2">
            {searching
              ? "Searching..."
              : `${searchResults!.length} result(s) for "${debouncedQuery}"`}
          </p>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm py-12 text-center">
            Loading...
          </div>
        ) : !isSearchMode &&
          folders.length === 0 &&
          displayFiles.length === 0 ? (
          <div className="text-gray-500 text-sm py-12 text-center">
            This folder is empty.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {!isSearchMode &&
                folders.map((folder) => (
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

              {displayFiles.map((file) => (
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
                  >
                    🔗
                  </button>
                </div>
              ))}
            </div>

            {!isSearchMode &&
              filePagination &&
              filePagination.page < filePagination.totalPages && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMoreFiles}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Load more files
                  </button>
                </div>
              )}
          </>
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
