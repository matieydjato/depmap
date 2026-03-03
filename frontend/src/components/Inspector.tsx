import type { DependencyGraph, FileNode, DeleteSimResult } from "../types";
import { PACKAGE_COLORS } from "../constants";

interface InspectorProps {
  file: FileNode | null;
  graph: DependencyGraph;
  deleteSim: DeleteSimResult | null;
  onClose: () => void;
  onSimulateDelete: () => void;
  onNodeNavigate: (id: string) => void;
}

function getPkgColor(graph: DependencyGraph, pkgName: string): string {
  const idx = graph.packages.findIndex((p) => p.name === pkgName);
  return idx >= 0 ? PACKAGE_COLORS[idx % PACKAGE_COLORS.length] : "#58a6ff";
}

export default function Inspector({
  file,
  graph,
  deleteSim,
  onClose,
  onSimulateDelete,
  onNodeNavigate,
}: InspectorProps) {
  if (!file) return null;

  return (
    <div
      className="absolute top-3 right-4 w-[360px] max-h-[calc(100vh-84px)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-4 z-10 overflow-y-auto text-[13px]"
      style={{ animation: "slideInRight 0.15s ease-out" }}
    >
      <button
        className="absolute top-3 right-3 bg-transparent border-none text-[var(--color-text-secondary)] text-lg leading-none cursor-pointer hover:text-[var(--color-text-primary)]"
        onClick={onClose}
      >
        &times;
      </button>

      <h2 className="text-[15px] text-[var(--color-text-primary)] mb-1 break-all pr-7">
        {file.name}
      </h2>
      <div className="text-[var(--color-text-secondary)] text-xs mb-2 break-all">{file.path}</div>

      {/* Meta: size + package */}
      <div className="flex gap-2.5 flex-wrap mb-3 items-center">
        <span className="text-xs text-[var(--color-text-secondary)]">
          Size: <strong className="text-[var(--color-text-primary)]">{file.sizeFormatted}</strong>
        </span>
        {file.package && (
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
              background: `${getPkgColor(graph, file.package)}22`,
              color: getPkgColor(graph, file.package),
            }}
          >
            {file.package}
          </span>
        )}
      </div>

      {/* Circular status */}
      <div>
        {file.isCircular ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(248,81,73,0.15)] text-[var(--color-accent-red)]">
            Circular Dependency
          </span>
        ) : (
          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(63,185,80,0.15)] text-[var(--color-accent-green)]">
            No Cycles
          </span>
        )}
      </div>

      {/* Simulate Delete */}
      <button
        className="mt-2.5 w-full py-2 px-3 bg-[rgba(248,81,73,0.1)] border border-[var(--color-accent-red)] rounded-[6px] text-[var(--color-accent-red)] text-[13px] font-semibold transition-all duration-150 hover:bg-[rgba(248,81,73,0.25)]"
        onClick={onSimulateDelete}
      >
        Simulate Deletion
      </button>

      {/* Delete Sim Results */}
      {deleteSim && (
        <div className="mt-3 p-3 bg-[rgba(248,81,73,0.06)] border border-[var(--color-border)] rounded-[6px]">
          <h3 className="text-[13px] text-[var(--color-accent-red)] mb-2">Deletion Impact</h3>

          <div className="flex justify-between py-1 text-xs border-b border-[var(--color-bg-tertiary)]">
            <span className="text-[var(--color-text-secondary)]">Directly affected</span>
            <span
              className={`font-semibold ${deleteSim.directlyAffected.length > 0 ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-primary)]"}`}
            >
              {deleteSim.directlyAffected.length} files
            </span>
          </div>
          <div className="flex justify-between py-1 text-xs border-b border-[var(--color-bg-tertiary)]">
            <span className="text-[var(--color-text-secondary)]">Transitively affected</span>
            <span className="text-[var(--color-text-primary)] font-semibold">
              {deleteSim.transitivelyAffected.length} files
            </span>
          </div>
          <div className="flex justify-between py-1 text-xs border-b border-[var(--color-bg-tertiary)]">
            <span className="text-[var(--color-text-secondary)]">Total impact</span>
            <span
              className={`font-semibold ${deleteSim.totalAffected > 0 ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-primary)]"}`}
            >
              {deleteSim.totalAffected} files
            </span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span className="text-[var(--color-text-secondary)]">Broken imports</span>
            <span
              className={`font-semibold ${deleteSim.brokenImports.length > 0 ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-primary)]"}`}
            >
              {deleteSim.brokenImports.length}
            </span>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mt-2.5 mb-1.5">
            Affected Files
          </div>
          <ul className="list-none p-0 mt-2 max-h-[150px] overflow-y-auto">
            {deleteSim.directlyAffected.length === 0 &&
              deleteSim.transitivelyAffected.length === 0 && (
                <li className="text-[var(--color-accent-green)]">No files would be affected</li>
              )}
            {deleteSim.directlyAffected.map((f) => (
              <li
                key={f}
                className="py-0.5 px-1.5 text-[11px] text-[var(--color-accent-red)] rounded cursor-pointer hover:bg-[var(--color-bg-tertiary)]"
                onClick={() => onNodeNavigate(f)}
              >
                🔴 {f}
              </li>
            ))}
            {deleteSim.transitivelyAffected.map((f) => (
              <li
                key={f}
                className="py-0.5 px-1.5 text-[11px] text-[var(--color-accent-orange)] rounded cursor-pointer hover:bg-[var(--color-bg-tertiary)]"
                onClick={() => onNodeNavigate(f)}
              >
                🟡 {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Imports */}
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mt-3 mb-1.5">
        Imports (<span>{file.imports.length}</span>)
      </div>
      <ul className="list-none p-0">
        {file.imports.length === 0 ? (
          <li className="text-[var(--color-text-muted)]">No imports</li>
        ) : (
          file.imports.map((imp) => {
            const isCirc = file.circularWith.includes(imp);
            return (
              <li
                key={imp}
                className={`py-1 px-2 rounded text-xs cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-tertiary)] ${
                  isCirc ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-secondary)]"
                }`}
                onClick={() => onNodeNavigate(imp)}
              >
                {isCirc && "🔴 "}
                {imp}
              </li>
            );
          })
        )}
      </ul>

      {/* Imported By */}
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mt-3 mb-1.5">
        Imported By (<span>{file.importedBy.length}</span>)
      </div>
      <ul className="list-none p-0">
        {file.importedBy.length === 0 ? (
          <li className="text-[var(--color-text-muted)]">Not imported by any file</li>
        ) : (
          file.importedBy.map((imp) => {
            const isCirc = file.circularWith.includes(imp);
            return (
              <li
                key={imp}
                className={`py-1 px-2 rounded text-xs cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-tertiary)] ${
                  isCirc ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-secondary)]"
                }`}
                onClick={() => onNodeNavigate(imp)}
              >
                {isCirc && "🔴 "}
                {imp}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
