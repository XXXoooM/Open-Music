import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToastStore } from "@/stores/toastStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-12 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl apple-glass border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {t.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-[#fa2d48] flex-shrink-0" />
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {t.title}
                </div>
                {t.description && (
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {t.description}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
