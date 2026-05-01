import { createContext, useContext, useMemo, useState } from "react";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { cn } from "../../lib/utils";

const ToastContext = createContext(null);

const toneMap = {
  error: {
    icon: FaTimesCircle,
    wrapper: "border-red-200 bg-white text-red-700",
  },
  success: {
    icon: FaCheckCircle,
    wrapper: "border-emerald-200 bg-white text-emerald-700",
  },
  info: {
    icon: FaInfoCircle,
    wrapper: "border-slate-200 bg-white text-slate-700",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      showToast({ description, title, variant = "info" }) {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts((current) => [...current, { id, title, description, variant }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3500);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const tone = toneMap[toast.variant] || toneMap.info;
          const Icon = tone.icon;

          return (
            <div
              className={cn(
                "pointer-events-auto rounded-3xl border px-4 py-4 shadow-strong",
                tone.wrapper,
              )}
              key={toast.id}
              role="status"
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 shrink-0 text-lg" />
                <div>
                  <p className="font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-slate-500">{toast.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
