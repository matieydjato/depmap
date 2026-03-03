/**
 * useToast — Manages toast notification state with auto-dismiss.
 */

import { useState, useCallback, useRef, useEffect } from "react";

export interface ToastData {
  message: string;
  type: "info" | "success" | "error";
}

interface UseToastReturn {
  /** Current toast to display, or null */
  toast: ToastData | null;
  /** Show a toast notification (auto-dismisses after 2.5s) */
  showToast: (message: string, type?: ToastData["type"]) => void;
}

/**
 * Hook that manages toast notifications with auto-dismiss.
 * Clears previous timer on rapid re-calls and on unmount.
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastData["type"] = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast };
}
