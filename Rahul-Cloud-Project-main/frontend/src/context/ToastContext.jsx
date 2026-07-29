import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const Ctx = createContext(null);
let _n = 0;

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = ++_n;
    setList((t) => [...t, { id, message, type }]);
    setTimeout(() => setList((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = (id) => setList((t) => t.filter((x) => x.id !== id));

  const meta = {
    success: { icon: CheckCircle2, cls: "text-emerald-600 dark:text-emerald-400" },
    error:   { icon: XCircle,      cls: "text-red-500 dark:text-red-400" },
    info:    { icon: Info,         cls: "text-accent-600 dark:text-accent-400" },
  };

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {list.map((t) => {
          const { icon: Icon, cls } = meta[t.type] ?? meta.info;
          return (
            <div
              key={t.id}
              className="
                pointer-events-auto flex items-center gap-3
                pl-3 pr-2 py-2.5
                bg-white dark:bg-ink-900
                border border-ink-200 dark:border-ink-800
                rounded-lg shadow-float
                text-sm text-ink-800 dark:text-ink-200
                animate-in min-w-[240px] max-w-xs
              "
              role="alert"
            >
              <Icon size={15} className={`flex-shrink-0 ${cls}`} />
              <span className="flex-1 text-[13px]">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="btn-ghost btn-icon flex-shrink-0 text-ink-400"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
