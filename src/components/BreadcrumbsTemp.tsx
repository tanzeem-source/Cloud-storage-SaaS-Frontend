import { BreadcrumbEntry } from '@/lib/types';

interface Props {
  trail: BreadcrumbEntry[];
  onNavigate: (index: number) => void;
}

export default function Breadcrumbs({ trail, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600 mb-4">
      {trail.map((entry, i) => (
        <div key={entry.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => onNavigate(i)}
            className={`px-1 py-0.5 rounded hover:bg-gray-100 ${
              i === trail.length - 1 ? 'font-medium text-gray-900' : 'text-blue-600'
            }`}
            disabled={i === trail.length - 1}
          >
            {entry.name}
          </button>
        </div>
      ))}
    </nav>
  );
}