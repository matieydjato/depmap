interface LegendProps {
  isMonorepo: boolean;
}

export default function Legend({ isMonorepo }: LegendProps) {
  return (
    <div className="absolute bottom-4 left-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[6px] py-2.5 px-3.5 z-10 text-xs flex gap-4">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-blue)]" /> File
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)]" /> Circular Dep
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-purple)]" /> Selected
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-orange)]" /> Affected
      </div>
      {isMonorepo && (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 border-t-2 border-dashed border-[var(--color-accent-cross-pkg)]" />{" "}
          Cross-Package
        </div>
      )}
    </div>
  );
}
