'use client';

interface Props {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
        title="List view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 border-l border-gray-300 ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4z" />
        </svg>
      </button>
    </div>
  );
}