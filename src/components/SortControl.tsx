'use client';

interface Props {
  sortBy: string;
  order: 'asc' | 'desc';
  onChange: (sortBy: string, order: 'asc' | 'desc') => void;
}

export default function SortControl({ sortBy, order, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-gray-500">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value, order)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1"
      >
        <option value="name">Name</option>
        <option value="size_bytes">Size</option>
        <option value="created_at">Date</option>
      </select>
      <button
        onClick={() => onChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50"
        title={order === 'asc' ? 'Ascending' : 'Descending'}
      >
        {order === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}