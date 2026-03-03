import type { MonorepoPackage } from "../types";

interface HeaderProps {
  stats: {
    totalFiles: number;
    totalEdges: number;
    circularCount: number;
    totalSizeFormatted: string;
  };
  isMonorepo: boolean;
  packages: MonorepoPackage[];
  sizeMode: "connections" | "fileSize";
  packageFilter: string;
  onToggleSizeMode: () => void;
  onPackageFilter: (pkg: string) => void;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onResetView: () => void;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col px-4 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-primary)] min-w-[70px]">
      <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--color-text-muted)]">
        {label}
      </span>
      <span
        className={`text-base font-bold ${accent ? "text-[var(--color-accent-green)]" : "text-[var(--color-text-primary)]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  ariaLabel,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? "bg-[#1f6feb] text-white"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
      }`}
      onClick={onClick}
      title={ariaLabel || label}
      aria-label={ariaLabel || label}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Header({
  stats,
  isMonorepo,
  packages,
  sizeMode,
  packageFilter,
  onToggleSizeMode,
  onPackageFilter,
  onExportJSON,
  onExportPNG,
  onResetView,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] z-10">
      {/* Left: Logo + Stats */}
      <div className="flex items-center gap-5">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <span className="text-[var(--color-accent-blue)]">DepMap</span>
        </h1>

        <div className="flex items-center gap-2">
          <StatCard label="Files" value={stats.totalFiles} />
          <StatCard label="Size" value={stats.totalSizeFormatted} />
          <StatCard label="Imports" value={stats.totalEdges} />
          <StatCard
            label="Circular"
            value={stats.circularCount}
            accent={stats.circularCount === 0}
          />
          {isMonorepo && <StatCard label="Packages" value={packages.length} />}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {isMonorepo && packages.length > 1 && (
          <select
            className="px-2.5 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] text-xs outline-none hover:border-[var(--color-text-secondary)] cursor-pointer mr-2"
            value={packageFilter}
            onChange={(e) => onPackageFilter(e.target.value)}
            title="Filter by package"
          >
            <option value="">All packages</option>
            {packages.map((pkg) => (
              <option key={pkg.name} value={pkg.name}>
                {pkg.name} ({pkg.fileCount})
              </option>
            ))}
          </select>
        )}

        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4h3v3H4V4zm5 0h3v3H9V4zM4 9h3v3H4V9zm5 0h3v3H9V9z" />
            </svg>
          }
          label="Size Toggle"
          onClick={onToggleSizeMode}
          active={sizeMode === "fileSize"}
          ariaLabel={`Size mode: ${sizeMode === "connections" ? "Connections" : "File Size"}`}
        />

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.22 14.78a.75.75 0 001.06-1.06L4.56 12h8.19a.75.75 0 000-1.5H4.56l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3a.75.75 0 000 1.06l3 3zm5.56-6.5a.75.75 0 11-1.06-1.06l1.72-1.72H3.25a.75.75 0 010-1.5h8.19L9.72 2.28a.75.75 0 011.06-1.06l3 3a.75.75 0 010 1.06l-3 3z" />
            </svg>
          }
          label="Export JSON"
          onClick={onExportJSON}
          ariaLabel="Export graph data as JSON"
        />
        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h13zM1.5 2A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 2h-13z" />
              <path d="M6.64 10.5L4.317 7.355l-.427-.523-.24.32L2 9.5h12l-2.89-4.233-.39-.546-.42.57L6.64 10.5z" />
            </svg>
          }
          label="Export PNG"
          onClick={onExportPNG}
          ariaLabel="Export graph as PNG image"
        />

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM1 8a7 7 0 1114 0A7 7 0 011 8zm7.5-3v2.5H11a.5.5 0 010 1H8a.5.5 0 01-.5-.5V5a.5.5 0 011 0z" />
            </svg>
          }
          label="Reset View"
          onClick={onResetView}
          ariaLabel="Reset zoom and position"
        />
      </div>
    </header>
  );
}
