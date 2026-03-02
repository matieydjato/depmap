import styles from './Toast.module.css';

interface ToastProps {
  toast: { message: string; type: 'info' | 'success' | 'error' } | null;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      {toast.message}
    </div>
  );
}
