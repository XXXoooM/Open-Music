import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useLyrics } from "@/hooks/useLyrics";
import { useDominantColor } from "@/hooks/useDominantColor";
import { AudioVisualizer } from "@/components/Player/AudioVisualizer";
import { Music2, Disc3, Mic2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const LyricsPage: React.FC = () => {
  const { currentTrack, currentTime, isPlaying, seek } = usePlayerStore();
  const { data: lyrics = [], isLoading, isError } = useLyrics(currentTrack);
  const { primary, secondary, glow } = useDominantColor(currentTrack?.pic);

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

  // Smooth Auto-scroll to center active line with easing
  useEffect(() => {
    if (isUserScrolling || activeIndex < 0) return;

    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isUserScrolling]);

  // User manual scroll detection: disable auto-scroll for 2.5 seconds
  const handleScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2500);
  };

  const handleLineClick = (time: number) => {
    seek(time);
    setIsUserScrolling(false);
  };

  if (!currentTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-400">
          <Disc3 className="w-8 h-8 opacity-40 animate-spin-slow" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
            暂无正在播放的歌曲
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            从左侧歌单或搜索页面挑选一首曲目，即可在此同步呈现沉浸式歌词
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Dynamic Apple Music Ambient Aurora / Stage Glow using extracted album art colors */}
      <motion.div
        animate={{
          scale: isPlaying ? [1, 1.18, 1.06, 1.2, 1] : 1,
          opacity: isPlaying ? [0.35, 0.5, 0.4, 0.55, 0.35] : 0.2,
          rotate: isPlaying ? [0, 5, -5, 3, 0] : 0,
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-3xl pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${primary} 0%, ${secondary} 45%, transparent 80%)`,
        }}
      />

      {/* Top Track Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 z-10">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <img
            src={currentTrack.pic}
            alt={currentTrack.name}
            className="w-12 h-12 rounded-2xl object-cover shadow-xl border border-black/5 dark:border-white/10"
          />
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-neutral-900 dark:text-white truncate flex items-center gap-2">
              {currentTrack.name}
              <AudioVisualizer isPlaying={isPlaying} color={primary} className="ml-1" />
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
          <span>Apple 沉浸式动态歌词</span>
        </div>
      </header>

      {/* Main Lyrics Scroll Stage */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-2xl flex-1 overflow-y-auto py-36 space-y-6 text-center no-scrollbar mask-radial-fade scroll-smooth"
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
                  scale: isActive ? 1.08 : distance <= 2 ? 0.98 : 0.94,
                  opacity: isActive ? 1 : distance === 1 ? 0.45 : 0.28,
                  filter: isActive ? "blur(0px)" : distance >= 3 ? "blur(0.6px)" : "blur(0px)",
                  color: isActive ? primary : undefined,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: isActive ? 1.1 : 1.02,
                  opacity: isActive ? 1 : 0.8,
                }}
                className={`cursor-pointer select-none px-6 py-2.5 rounded-2xl transition-colors duration-200 ${
                  isActive
                    ? "text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.2)]"
                    : "text-neutral-800 dark:text-neutral-200 text-lg sm:text-xl font-semibold"
                }`}
              >
                {line.text}
              </motion.div>
            );
          })
        )}
      </main>

      {/* Floating prompt when user scrolls manually */}
      <AnimatePresence>
        {isUserScrolling && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 px-4 py-1.5 rounded-full bg-black/70 dark:bg-white/15 backdrop-blur-md text-white text-xs font-medium shadow-lg"
          >
            已暂停自动跟随 · 2.5 秒后恢复
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default LyricsPage;
