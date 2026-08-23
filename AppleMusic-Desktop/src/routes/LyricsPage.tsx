import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useLyrics } from "@/hooks/useLyrics";
import { Music2, Disc3, Mic2, AlertCircle, Loader2, Sparkles } from "lucide-react";

export const LyricsPage: React.FC = () => {
  const { currentTrack, currentTime, isPlaying, seek } = usePlayerStore();
  const { data: lyrics = [], isLoading, isError } = useLyrics(currentTrack);

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

  // Smooth Auto-scroll to center active line
  useEffect(() => {
    if (isUserScrolling || activeIndex < 0) return;

    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isUserScrolling]);

  // User manual scroll detection: disable auto-scroll for 2 seconds
  const handleScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
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
    <div className="relative h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden animate-in fade-in duration-500">
      {/* Background Ambient Glow matching album art */}
      <div
        className="absolute inset-0 opacity-25 dark:opacity-20 blur-3xl pointer-events-none -z-10 scale-125 transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at center, #fa2d48 0%, transparent 70%)`,
        }}
      />

      {/* Top Track Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 z-10">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <img
            src={currentTrack.pic}
            alt={currentTrack.name}
            className="w-12 h-12 rounded-xl object-cover shadow-lg border border-black/5 dark:border-white/10"
          />
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-neutral-900 dark:text-white truncate flex items-center gap-2">
              {currentTrack.name}
              {isPlaying && <Sparkles className="w-3.5 h-3.5 text-[#fa2d48] animate-pulse" />}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {currentTrack.artist} · {currentTrack.album || "单曲精选"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#fa2d48] bg-[#fa2d48]/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Mic2 className="w-3.5 h-3.5" />
          <span>动态实时歌词</span>
        </div>
      </header>

      {/* Main Lyrics Scroll Stage */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-2xl flex-1 overflow-y-auto py-32 space-y-7 text-center no-scrollbar mask-radial-fade scroll-smooth"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#fa2d48]" />
            <span className="text-sm font-medium">加载歌词中...</span>
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
            <span className="text-sm font-medium">暂无歌词</span>
            <span className="text-xs">纯音乐或暂未收录歌词文本</span>
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                className={`transition-all duration-300 cursor-pointer select-none px-4 py-2 rounded-2xl ${
                  isActive
                    ? "text-[#fa2d48] text-2xl sm:text-3xl font-extrabold scale-105 drop-shadow-md"
                    : "text-neutral-400/80 dark:text-neutral-500/80 hover:text-neutral-800 dark:hover:text-neutral-200 text-lg sm:text-xl font-medium hover:scale-[1.02]"
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </main>

      {/* Floating prompt when user scrolls manually */}
      {isUserScrolling && (
        <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-black/60 dark:bg-white/10 backdrop-blur-md text-white text-xs font-medium animate-in fade-in duration-200">
          已暂停自动跟随 · 2 秒后恢复
        </div>
      )}
    </div>
  );
};
export default LyricsPage;
