import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "apple";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
  disableAnimation?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disableAnimation = false, ...props }, ref) => {
    const variants = {
      default: "bg-[#fa2d48] text-white hover:bg-[#ff3b56] shadow-sm shadow-[#fa2d48]/20",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
      outline: "border border-black/10 dark:border-white/15 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200",
      secondary: "bg-black/[0.04] text-neutral-800 hover:bg-black/[0.08] dark:bg-white/[0.08] dark:text-neutral-100 dark:hover:bg-white/[0.12]",
      ghost: "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
      link: "text-[#fa2d48] underline-offset-4 hover:underline p-0 h-auto font-normal",
      glass: "apple-glass hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-100",
      apple: "bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25 hover:bg-[#ff3b56]",
    };

    const sizes = {
      default: "h-8 rounded-xl px-3.5 text-xs font-semibold",
      sm: "h-7 rounded-lg px-2.5 text-xs font-medium",
      lg: "h-10 rounded-2xl px-6 text-sm font-semibold",
      icon: "h-8 w-8 rounded-full p-0 flex items-center justify-center flex-shrink-0",
      pill: "h-8 px-4 rounded-full text-xs font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disableAnimation ? undefined : { scale: variant === "link" ? 1 : 1.025 }}
        whileTap={disableAnimation ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa2d48] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
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
