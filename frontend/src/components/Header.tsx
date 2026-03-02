import type { MonorepoPackage } from '../types';
import styles from './Header.module.css';

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
    <header className={styles.header}>
      <h1 className={styles.title}>
        🗺️ <span className={styles.brand}>DepMap</span>
      </h1>

      <div className={styles.right}>
        <div className={styles.stats}>
          <div>
            <span className={styles.statValue}>{stats.totalFiles}</span> files
          </div>
          <div>
            <span className={styles.statValue}>{stats.totalSizeFormatted}</span>
          </div>
          <div>
            <span className={styles.statValue}>{stats.totalEdges}</span> imports
          </div>
          <div className={stats.circularCount > 0 ? styles.circular : ''}>
            <span className={`${styles.statValue} ${stats.circularCount > 0 ? styles.circular : ''}`}>
              {stats.circularCount}
            </span>{' '}circular
          </div>
          {isMonorepo && (
            <div>
              <span className={styles.statValue}>{packages.length}</span> packages
            </div>
          )}
        </div>

        <div className={styles.toolbar}>
          {isMonorepo && packages.length > 1 && (
            <select
              className={styles.select}
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
            className={`${styles.btn} ${sizeMode === 'fileSize' ? styles.btnActive : ''}`}
            onClick={onToggleSizeMode}
            title="Toggle node sizing: connections vs file size"
          >
            Size: {sizeMode === 'connections' ? 'Connections' : 'File Size'}
          </button>
          <button className={styles.btn} onClick={onExportJSON} title="Export graph data as JSON">
            Export JSON
          </button>
          <button className={styles.btn} onClick={onExportPNG} title="Export graph as PNG image">
            Export PNG
          </button>
          <button className={styles.btn} onClick={onResetView} title="Reset zoom and position">
            Reset View
          </button>
        </div>
      </div>
    </header>
  );
}
