"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { FileItem } from "@/lib/types";

interface Props {
  file: FileItem;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: Props) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";
  const isText = file.mime_type?.startsWith("text/");
  const isVideo = file.mime_type?.startsWith("video/");
  const isAudio = file.mime_type?.startsWith("audio/");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/files/${file.id}/download-url`);
        setDownloadUrl(data.downloadUrl);

        if (isText) {
          const res = await fetch(data.downloadUrl);
          const text = await res.text();
          setTextContent(text.slice(0, 5000)); // cap preview length
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [file.id, isText]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium truncate">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 px-2"
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading preview...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && downloadUrl && (
          <>
            {isImage && (
              <img
                src={downloadUrl}
                alt={file.name}
                className="max-w-full mx-auto rounded"
              />
            )}
            {isPdf && (
              <iframe
                src={downloadUrl}
                className="w-full h-[70vh] border rounded"
              />
            )}
            {isText && (
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                {textContent}
              </pre>
            )}
            {isVideo && (
              <video
                src={downloadUrl}
                controls
                className="w-full max-h-[70vh] rounded"
              />
            )}
            {isAudio && (
              <audio src={downloadUrl} controls className="w-full mt-4" />
            )}
            {!isImage && !isPdf && !isText && !isVideo && !isAudio && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-3">
                  No preview available for this file type.
                </p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Download instead
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
