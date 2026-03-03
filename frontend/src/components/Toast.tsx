interface ToastProps {
  toast: { message: string; type: "info" | "success" | "error" } | null;
}

const TYPE_COLORS = {
  info: "bg-[#1f6feb]",
  success: "bg-[#238636]",
  error: "bg-[#da3633]",
} as const;

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 text-white py-2.5 px-[18px] rounded-[6px] text-[13px] z-[100] shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${TYPE_COLORS[toast.type]}`}
      style={{ animation: "slideInUp 0.2s ease-out" }}
    >
      {toast.message}
    </div>
  );
}
