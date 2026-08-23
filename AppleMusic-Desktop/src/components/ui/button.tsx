import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "apple";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#fa2d48] text-white hover:bg-[#ff3b56] shadow-sm shadow-[#fa2d48]/20",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
      outline: "border border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
      secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700",
      ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200",
      link: "text-[#fa2d48] underline-offset-4 hover:underline",
      glass: "apple-glass hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-100",
      apple: "bg-[#fa2d48] text-white hover:scale-105 active:scale-95 shadow-md shadow-[#fa2d48]/30 transition-all",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-2xl px-8 text-base font-semibold",
      icon: "h-9 w-9 rounded-full",
      pill: "h-10 px-6 rounded-full text-sm font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa2d48] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
