import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
export function Modal({ title, onClose, children, size = "md" }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const h = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(FOCUSABLE);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);
  const maxW = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/40 dark:bg-ink-950/60 backdrop-blur-[3px] animate-in-fast cursor-default"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${maxW}
          bg-white dark:bg-ink-900
          border border-ink-200/80 dark:border-ink-800
          rounded-t-2xl sm:rounded-xl
          shadow-modal animate-scale-in
          overflow-hidden
        `}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink-100 dark:border-ink-800">
          <h2 id="modal-title" className="text-sm font-semibold text-ink-900 dark:text-ink-100">
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="btn-ghost btn-icon text-ink-400"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
export function ConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-secondary btn-sm">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger btn-sm flex items-center gap-1.5">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </Modal>
  );
}
