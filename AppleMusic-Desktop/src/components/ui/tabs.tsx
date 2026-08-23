import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  items: { value: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export const SegmentedTabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  items,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/5",
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
              "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none flex items-center gap-1.5 z-10",
              isActive
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-tab-pill"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/10 -z-10"
              />
            )}
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
