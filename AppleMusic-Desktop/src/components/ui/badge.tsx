import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "apple" | "secondary" | "outline" | "success";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
    apple: "bg-[#fa2d48]/10 text-[#fa2d48] border border-[#fa2d48]/20",
    secondary: "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300",
    outline: "border border-black/10 dark:border-white/15 text-neutral-600 dark:text-neutral-400",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
