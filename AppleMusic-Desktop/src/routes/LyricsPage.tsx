import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useLyrics } from "@/hooks/useLyrics";
import { useDominantColor } from "@/hooks/useDominantColor";
import { AudioVisualizer } from "@/components/Player/AudioVisualizer";
import { Music2, Mic2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export const LyricsPage: React.FC = () => {
  const { currentTrack, currentTime, isPlaying, seek } = usePlayerStore();
  const { data: lyrics = [], isLoading, isError } = useLyrics(currentTrack);
  const { primary, secondary, accent, glow, meshGradient } = useDominantColor(currentTrack?.pic);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  // Compute active lyric index based on current playback time
  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let index = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, currentTime]);

  // Smooth Auto-scroll to center active line with spring-like easing
  useEffect(() => {
    if (isUserScrolling || activeIndex < 0) return;

    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isUserScrolling]);

  // Handle user manual scrolling without interrupting immediate navigation
  const handleScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2500);
  }, []);

  const handleLineClick = (time: number) => {
    seek(time);
    setIsUserScrolling(false);
  };

  if (!currentTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 select-none">
        <div className="w-20 h-20 rounded-3xl glass-enhanced flex items-center justify-center text-neutral-400">
          <Music2 className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
            暂无正在播放的歌曲
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            从左侧歌单或搜索页面挑选一首曲目，即可在此同步呈现沉浸式歌词舞台
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* 1. Multi-Layer Dynamic Apple Mesh Aurora Lighting */}
      <motion.div
        animate={{
          scale: isPlaying ? [1, 1.15, 1.05, 1.2, 1] : 1,
          opacity: isPlaying ? [0.32, 0.48, 0.36, 0.52, 0.32] : 0.18,
          rotate: isPlaying ? [0, 4, -4, 2, 0] : 0,
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 aura-orb pointer-events-none -z-10"
        style={{
          background: meshGradient,
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 aura-orb pointer-events-none -z-10"
        style={{ backgroundColor: accent, opacity: isPlaying ? 0.2 : 0.1 }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 aura-orb pointer-events-none -z-10"
        style={{ backgroundColor: secondary, opacity: isPlaying ? 0.25 : 0.1 }}
      />

      {/* 2. Top Track Glass Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] z-10">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <img
            src={currentTrack.pic}
            alt={currentTrack.name}
            className="w-12 h-12 rounded-2xl object-cover shadow-xl border border-black/10 dark:border-white/15"
          />
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-neutral-900 dark:text-white truncate flex items-center gap-2">
              <span>{currentTrack.name}</span>
              <AudioVisualizer isPlaying={isPlaying} color={primary} className="ml-1 flex-shrink-0" />
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {currentTrack.artist} · {currentTrack.album || "单曲精选"}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md transition-colors"
          style={{ backgroundColor: glow, color: primary }}
        >
          <Mic2 className="w-3.5 h-3.5" />
          <span>Apple 沉浸式歌词</span>
        </div>
      </header>

      {/* 3. Main Lyrics Stage with Dynamic Distance Blur */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-2xl flex-1 overflow-y-auto py-40 space-y-7 text-center no-scrollbar scroll-smooth"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#fa2d48]" />
            <span className="text-sm font-medium">正在解析同步歌词...</span>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 text-neutral-400">
            <AlertCircle className="w-7 h-7 text-red-500/60" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              歌词加载失败
            </span>
            <span className="text-xs text-neutral-500">无法从服务器获取该歌曲的 LRC 歌词数据</span>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 text-neutral-400">
            <Music2 className="w-8 h-8 opacity-30" />
            <span className="text-sm font-medium">纯音乐 / 暂无歌词</span>
            <span className="text-xs">请尽情享受美妙旋律</span>
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const distance = Math.abs(idx - activeIndex);

            return (
              <motion.div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                initial={false}
                animate={{
                  scale: isActive ? 1.09 : distance === 1 ? 0.98 : distance === 2 ? 0.95 : 0.92,
                  opacity: isActive ? 1 : distance === 1 ? 0.5 : distance === 2 ? 0.32 : 0.18,
                  filter: isActive ? "blur(0px)" : distance >= 3 ? "blur(1.2px)" : distance >= 2 ? "blur(0.6px)" : "blur(0px)",
                  color: isActive ? primary : undefined,
                }}
                transition={{
                  duration: 0.36,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: isActive ? 1.11 : 1.02,
                  opacity: isActive ? 1 : 0.85,
                }}
                className={`cursor-pointer select-none px-6 py-2 rounded-2xl transition-colors duration-200 ${
                  isActive
                    ? "text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
                    : "text-neutral-800 dark:text-neutral-200 text-lg sm:text-xl font-semibold"
                }`}
              >
                {line.text}
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default LyricsPage;
