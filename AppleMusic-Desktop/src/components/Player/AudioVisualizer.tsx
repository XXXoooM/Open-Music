import React from "react";
import { motion } from "motion/react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 4,
  className = "",
  color = "#fa2d48",
}) => {
  return (
    <div className={`flex items-end gap-0.5 h-4 w-4 ${className}`} title={isPlaying ? "正在播放" : "已暂停"}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: isPlaying
              ? i === 0
                ? ["25%", "85%", "40%", "100%", "25%"]
                : i === 1
                ? ["60%", "20%", "95%", "40%", "60%"]
                : i === 2
                ? ["90%", "35%", "70%", "20%", "90%"]
                : ["30%", "75%", "20%", "85%", "30%"]
              : "20%",
          }}
          transition={{
            duration: 0.65 + i * 0.12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
