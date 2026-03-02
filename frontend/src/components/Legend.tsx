import styles from './Legend.module.css';

interface LegendProps {
  isMonorepo: boolean;
}

export default function Legend({ isMonorepo }: LegendProps) {
  return (
    <div className={styles.legend}>
      <div className={styles.item}>
        <div className={`${styles.dot} ${styles.normal}`} /> File
      </div>
      <div className={styles.item}>
        <div className={`${styles.dot} ${styles.circular}`} /> Circular Dep
      </div>
      <div className={styles.item}>
        <div className={`${styles.dot} ${styles.selected}`} /> Selected
      </div>
      <div className={styles.item}>
        <div className={`${styles.dot} ${styles.affected}`} /> Affected
      </div>
      {isMonorepo && (
        <div className={styles.item}>
          <div className={styles.crossPkgLine} /> Cross-Package
        </div>
      )}
    </div>
  );
}
