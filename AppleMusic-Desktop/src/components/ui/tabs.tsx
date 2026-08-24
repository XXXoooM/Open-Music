import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  items: { value: string; label: string; icon?: React.ReactNode }[];
  className?: string;
  layoutId?: string;
}

export const SegmentedTabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  items,
  className,
  layoutId,
}) => {
  const instanceId = React.useId();
  const effectiveLayoutId = layoutId || `segmented-pill-${instanceId}`;

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[#E5E5EA] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] select-none",
        className
      )}
    >
      {items.map((item) => {
        const isActive = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none flex items-center gap-1.5 z-10",
              isActive
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={effectiveLayoutId}
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-white dark:bg-[#2C2C2E] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] border border-black/[0.04] dark:border-white/[0.08] -z-10"
              />
            )}
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
