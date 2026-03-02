import type { DependencyGraph, FileNode, DeleteSimResult } from '../types';
import styles from './Inspector.module.css';

const PACKAGE_COLORS = [
  '#58a6ff', '#3fb950', '#d2a8ff', '#f0883e', '#f778ba',
  '#a5d6ff', '#d29922', '#79c0ff', '#7ee787', '#ff7b72',
];

interface InspectorProps {
  file: FileNode | null;
  graph: DependencyGraph;
  deleteSim: DeleteSimResult | null;
  onClose: () => void;
  onSimulateDelete: () => void;
  onNodeNavigate: (id: string) => void;
}

function getPkgColor(graph: DependencyGraph, pkgName: string): string {
  const idx = graph.packages.findIndex(p => p.name === pkgName);
  return idx >= 0 ? PACKAGE_COLORS[idx % PACKAGE_COLORS.length] : '#58a6ff';
}

export default function Inspector({
  file, graph, deleteSim, onClose, onSimulateDelete, onNodeNavigate,
}: InspectorProps) {
  if (!file) return null;

  return (
    <div className={styles.inspector}>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>

      <h2 className={styles.name}>{file.name}</h2>
      <div className={styles.filePath}>{file.path}</div>

      {/* Meta: size + package */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          Size: <strong>{file.sizeFormatted}</strong>
        </span>
        {file.package && (
          <span
            className={styles.pkgBadge}
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
          <span className={`${styles.badge} ${styles.badgeCircular}`}>Circular Dependency</span>
        ) : (
          <span className={`${styles.badge} ${styles.badgeOk}`}>No Cycles</span>
        )}
      </div>

      {/* Simulate Delete */}
      <button className={styles.simDeleteBtn} onClick={onSimulateDelete}>
        Simulate Deletion
      </button>

      {/* Delete Sim Results */}
      {deleteSim && (
        <div className={styles.simResults}>
          <h3 className={styles.simTitle}>Deletion Impact</h3>

          <div className={styles.simStat}>
            <span className={styles.simLabel}>Directly affected</span>
            <span className={`${styles.simValue} ${deleteSim.directlyAffected.length > 0 ? styles.danger : ''}`}>
              {deleteSim.directlyAffected.length} files
            </span>
          </div>
          <div className={styles.simStat}>
            <span className={styles.simLabel}>Transitively affected</span>
            <span className={styles.simValue}>{deleteSim.transitivelyAffected.length} files</span>
          </div>
          <div className={styles.simStat}>
            <span className={styles.simLabel}>Total impact</span>
            <span className={`${styles.simValue} ${deleteSim.totalAffected > 0 ? styles.danger : ''}`}>
              {deleteSim.totalAffected} files
            </span>
          </div>
          <div className={styles.simStat}>
            <span className={styles.simLabel}>Broken imports</span>
            <span className={`${styles.simValue} ${deleteSim.brokenImports.length > 0 ? styles.danger : ''}`}>
              {deleteSim.brokenImports.length}
            </span>
          </div>

          <div className={styles.sectionTitle} style={{ marginTop: 10 }}>Affected Files</div>
          <ul className={styles.simFileList}>
            {deleteSim.directlyAffected.length === 0 && deleteSim.transitivelyAffected.length === 0 && (
              <li style={{ color: 'var(--accent-green)' }}>No files would be affected</li>
            )}
            {deleteSim.directlyAffected.map(f => (
              <li key={f} className={styles.direct} onClick={() => onNodeNavigate(f)}>
                🔴 {f}
              </li>
            ))}
            {deleteSim.transitivelyAffected.map(f => (
              <li key={f} className={styles.transitive} onClick={() => onNodeNavigate(f)}>
                🟡 {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Imports */}
      <div className={styles.sectionTitle}>
        Imports (<span>{file.imports.length}</span>)
      </div>
      <ul className={styles.depList}>
        {file.imports.length === 0 ? (
          <li style={{ color: 'var(--text-muted)' }}>No imports</li>
        ) : (
          file.imports.map(imp => {
            const isCirc = file.circularWith.includes(imp);
            return (
              <li
                key={imp}
                className={isCirc ? styles.circularItem : ''}
                onClick={() => onNodeNavigate(imp)}
              >
                {isCirc && '🔴 '}{imp}
              </li>
            );
          })
        )}
      </ul>

      {/* Imported By */}
      <div className={styles.sectionTitle}>
        Imported By (<span>{file.importedBy.length}</span>)
      </div>
      <ul className={styles.depList}>
        {file.importedBy.length === 0 ? (
          <li style={{ color: 'var(--text-muted)' }}>Not imported by any file</li>
        ) : (
          file.importedBy.map(imp => {
            const isCirc = file.circularWith.includes(imp);
            return (
              <li
                key={imp}
                className={isCirc ? styles.circularItem : ''}
                onClick={() => onNodeNavigate(imp)}
              >
                {isCirc && '🔴 '}{imp}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
