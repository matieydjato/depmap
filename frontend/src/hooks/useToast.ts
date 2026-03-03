/**
 * useToast — Manages toast notification state with auto-dismiss.
 */

import { useState, useCallback } from "react";

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
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((message: string, type: ToastData["type"] = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast };
}
