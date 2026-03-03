import { useState } from "react";

interface LegendProps {
  isMonorepo: boolean;
}

export default function Legend({ isMonorepo }: LegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      role="complementary"
      aria-label="Graph legend"
      className="absolute bottom-4 left-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg z-10 text-xs overflow-hidden"
    >
      <button
        className="flex items-center justify-between w-full px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
      >
        Legend
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`ml-3 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
        >
          <path d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z" />
        </svg>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2.5 px-3.5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-blue)]" />
            <span className="text-[var(--color-text-secondary)]">File</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-red)]" />
            <span className="text-[var(--color-text-secondary)]">Circular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-green)]" />
            <span className="text-[var(--color-text-secondary)]">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-orange)]" />
            <span className="text-[var(--color-text-secondary)]">Affected</span>
          </div>
          {isMonorepo && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 border-t-2 border-dashed border-[var(--color-accent-cross-pkg)]" />
              <span className="text-[var(--color-text-secondary)]">Cross-Package</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
