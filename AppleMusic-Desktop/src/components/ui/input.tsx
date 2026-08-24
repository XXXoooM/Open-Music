import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-3.5 py-2 text-xs font-medium transition-all placeholder:text-[#86868b] border border-black/[0.04] dark:border-white/[0.06] focus-visible:outline-none focus-visible:bg-white dark:focus-visible:bg-[#1E1E22] focus-visible:ring-2 focus-visible:ring-[#FA2D48]/30 focus-visible:border-[#FA2D48]/50 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-900 dark:text-neutral-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
