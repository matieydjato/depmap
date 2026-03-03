import { useRef, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          aria-label="Search files"
          className="w-[280px] py-2.5 pl-9 pr-14 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] text-sm outline-none transition-colors duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] focus:bg-[var(--color-bg-primary)]"
          placeholder="Search files..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-muted)] font-mono">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
