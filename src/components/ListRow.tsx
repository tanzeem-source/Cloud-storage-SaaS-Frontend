'use client';

import { FolderIcon, FileIcon } from '@/components/Icons';
import { formatBytes, formatDate } from '@/lib/format';
import ItemMenu from '@/components/ItemMenu';

interface Props {
  type: 'folder' | 'file';
  name: string;
  sizeBytes?: number;
  date: string;
  onOpen: () => void;
  actions: { label: string; onClick: () => void; danger?: boolean }[];
}

export default function ListRow({ type, name, sizeBytes, date, onOpen, actions }: Props) {
  return (
    <div className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md group">
      <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-6 h-6 flex-shrink-0">
          {type === 'folder' ? <FolderIcon /> : <FileIcon />}
        </div>
        <span className="text-sm text-gray-800 truncate">{name}</span>
      </button>
      <span className="text-xs text-gray-400 w-24 flex-shrink-0 text-right hidden sm:block">
        {sizeBytes !== undefined ? formatBytes(sizeBytes) : '—'}
      </span>
      <span className="text-xs text-gray-400 w-28 flex-shrink-0 text-right hidden sm:block">
        {formatDate(date)}
      </span>
      <div className="ml-2 opacity-0 group-hover:opacity-100 transition">
        <ItemMenu actions={actions} />
      </div>
    </div>
  );
}