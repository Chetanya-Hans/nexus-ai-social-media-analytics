import { X } from "lucide-react";
import { useEffect } from "react";

// Generic modal / side panel used for trend details, node details, alert details, etc.
export default function Modal({ open, onClose, title, children }) {
  // Close on Escape key for keyboard accessibility.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-ink-primary">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg hover:bg-base-surface2 text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
