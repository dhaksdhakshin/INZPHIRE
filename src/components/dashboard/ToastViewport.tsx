import { useDashboard } from "../../core/dashboard-context";

export default function ToastViewport() {
  const { toasts, dismissToast } = useDashboard();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => dismissToast(toast.id)}>
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
