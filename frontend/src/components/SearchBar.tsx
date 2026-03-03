interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="absolute top-3 left-4 z-10">
      <input
        type="text"
        aria-label="Search files"
        className="w-[280px] py-2 px-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-secondary)] text-sm outline-none transition-colors duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)]"
        placeholder="Search files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
