import type { MonorepoPackage } from '../types';

interface HeaderProps {
  stats: {
    totalFiles: number;
    totalEdges: number;
    circularCount: number;
    totalSizeFormatted: string;
  };
  isMonorepo: boolean;
  packages: MonorepoPackage[];
  sizeMode: 'connections' | 'fileSize';
  packageFilter: string;
  onToggleSizeMode: () => void;
  onPackageFilter: (pkg: string) => void;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onResetView: () => void;
}

export default function Header({
  stats, isMonorepo, packages, sizeMode, packageFilter,
  onToggleSizeMode, onPackageFilter, onExportJSON, onExportPNG, onResetView,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] h-14 z-10">
      <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
        🗺️ <span className="text-[var(--color-accent-blue)]">DepMap</span>
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex gap-4 text-[13px] text-[var(--color-text-secondary)]">
          <div>
            <span className="text-[var(--color-text-primary)] font-semibold">{stats.totalFiles}</span> files
          </div>
          <div>
            <span className="text-[var(--color-text-primary)] font-semibold">{stats.totalSizeFormatted}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-primary)] font-semibold">{stats.totalEdges}</span> imports
          </div>
          <div className={stats.circularCount > 0 ? 'text-[var(--color-accent-red)]' : ''}>
            <span className={`font-semibold ${stats.circularCount > 0 ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-text-primary)]'}`}>
              {stats.circularCount}
            </span>{' '}circular
          </div>
          {isMonorepo && (
            <div>
              <span className="text-[var(--color-text-primary)] font-semibold">{packages.length}</span> packages
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isMonorepo && packages.length > 1 && (
            <select
              className="px-2.5 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-secondary)] text-xs outline-none hover:border-[var(--color-text-secondary)] cursor-pointer"
              value={packageFilter}
              onChange={e => onPackageFilter(e.target.value)}
              title="Filter by package"
            >
              <option value="">All packages</option>
              {packages.map(pkg => (
                <option key={pkg.name} value={pkg.name}>
                  {pkg.name} ({pkg.fileCount})
                </option>
              ))}
            </select>
          )}

          <button
            className={`flex items-center gap-1 px-3 py-1.5 border rounded-[6px] text-xs transition-all duration-150 ${
              sizeMode === 'fileSize'
                ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
            }`}
            onClick={onToggleSizeMode}
            title="Toggle node sizing: connections vs file size"
          >
            Size: {sizeMode === 'connections' ? 'Connections' : 'File Size'}
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-secondary)] text-xs transition-all duration-150 hover:bg-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
            onClick={onExportJSON}
            title="Export graph data as JSON"
          >
            Export JSON
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-secondary)] text-xs transition-all duration-150 hover:bg-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
            onClick={onExportPNG}
            title="Export graph as PNG image"
          >
            Export PNG
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-secondary)] text-xs transition-all duration-150 hover:bg-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
            onClick={onResetView}
            title="Reset zoom and position"
          >
            Reset View
          </button>
        </div>
      </div>
    </header>
  );
}
