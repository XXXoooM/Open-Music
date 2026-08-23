import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number; // 0 to 1 or custom max
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (val: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onValueChange,
  className,
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center group py-2", className)}>
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full bg-[#fa2d48] rounded-full transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute w-3.5 h-3.5 bg-white border border-neutral-300 dark:border-neutral-600 rounded-full shadow-md pointer-events-none group-hover:scale-125 transition-transform"
        style={{ left: `calc(${percentage}% - 7px)` }}
      />
    </div>
  );
};
