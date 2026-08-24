import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "default" | "brand-blue" | "secondary" | "ghost" | "destructive" | "link" | "apple" | "glass";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
  disableAnimation?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disableAnimation = false, ...props }, ref) => {
    const variants = {
      default: "bg-[#FA2D48] text-white hover:brightness-105 shadow-sm shadow-[#FA2D48]/25",
      "brand-blue": "bg-[#0071E3] text-white hover:brightness-105 shadow-sm shadow-[#0071E3]/25",
      secondary: "bg-[#E5E5EA] text-neutral-900 hover:bg-[#DCDCE2] dark:bg-[#2C2C2E] dark:text-neutral-100 dark:hover:bg-[#3A3A3C]",
      ghost: "hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
      link: "text-[#FA2D48] underline-offset-4 hover:underline p-0 h-auto font-normal",
      glass: "bg-[#E5E5EA]/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md text-neutral-900 dark:text-neutral-100 hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E]",
      apple: "bg-[#FA2D48] text-white shadow-md shadow-[#FA2D48]/25 hover:brightness-105",
    };

    const sizes = {
      default: "h-8 rounded-full px-4 text-xs font-semibold",
      sm: "h-7 rounded-full px-3 text-xs font-medium",
      lg: "h-10 rounded-full px-6 text-sm font-semibold",
      icon: "h-8 w-8 rounded-full p-0 flex items-center justify-center flex-shrink-0",
      pill: "h-8 px-4 rounded-full text-xs font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disableAnimation ? undefined : { scale: 1.02 }}
        whileTap={disableAnimation ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA2D48] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
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
