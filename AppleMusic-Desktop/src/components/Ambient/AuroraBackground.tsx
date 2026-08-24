import React from "react";
import { motion } from "motion/react";
import { useDominantColor } from "@/hooks/useDominantColor";
import { usePlayerStore } from "@/stores/playerStore";

export const AuroraBackground: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayerStore();
  const { primary, secondary, accent } = useDominantColor(currentTrack?.pic);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Orb 1: Top-Left Sky Blue / Dynamic Accent */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: isPlaying ? [1, 1.12, 0.95, 1] : 1,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed -top-[20vw] -left-[15vw] w-[55vw] h-[55vw] rounded-full filter blur-[90px] opacity-40 dark:opacity-25"
        style={{
          background: currentTrack
            ? `radial-gradient(circle, ${accent} 0%, rgba(162, 210, 255, 0.4) 60%, transparent 80%)`
            : "radial-gradient(circle, rgba(162, 210, 255, 0.6) 0%, rgba(200, 180, 255, 0.3) 60%, transparent 80%)",
        }}
      />

      {/* Orb 2: Bottom-Right Apple Crimson / Primary */}
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -20, 0],
          scale: isPlaying ? [1, 1.15, 1.05, 1] : 1,
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed -bottom-[20vw] -right-[15vw] w-[55vw] h-[55vw] rounded-full filter blur-[90px] opacity-35 dark:opacity-20"
        style={{
          background: currentTrack
            ? `radial-gradient(circle, ${primary} 0%, ${secondary} 60%, transparent 80%)`
            : "radial-gradient(circle, rgba(250, 45, 72, 0.35) 0%, rgba(200, 180, 255, 0.25) 60%, transparent 80%)",
        }}
      />

      {/* Orb 3: Center Ambient Lavender Glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.96, 1],
          opacity: [0.25, 0.35, 0.22, 0.25],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-[30%] left-[25%] w-[50vw] h-[50vw] rounded-full filter blur-[100px] opacity-25 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(200, 180, 255, 0.45) 0%, rgba(162, 210, 255, 0.2) 60%, transparent 80%)",
        }}
      />
    </div>
  );
};
