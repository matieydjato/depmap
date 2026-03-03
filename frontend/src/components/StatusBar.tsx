export default function StatusBar() {
  return (
    <footer className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] z-10">
      <div className="flex items-center gap-4">
        <span>
          <svg
            className="inline-block mr-1 -mt-0.5"
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 16A8 8 0 108 0a8 8 0 000 16zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
            <path d="M6 6h4v4H6z" />
          </svg>
          DepMap v0.1.0
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] inline-block" />
          Connection: Stable
        </span>
      </div>
      <span>Force-directed Layout Engine (Default)</span>
    </footer>
  );
}
