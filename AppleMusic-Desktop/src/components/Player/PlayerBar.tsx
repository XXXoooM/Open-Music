import React, { useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  Mic2
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/Player/AudioVisualizer";
import { motion } from "motion/react";
import { toast } from "@/stores/toastStore";

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    next,
    prev,
    togglePlayMode,
  } = usePlayerStore();

  const { activeView, setActiveView, isFavorite, toggleFavorite } = usePlaylistStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentTrack ? isFavorite(currentTrack.id) : false;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(ratio);
  };

  return (
    <footer className="h-18 w-full apple-player-glass fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 select-none border-t border-black/[0.06] dark:border-white/[0.08]">
      {/* Cluster 1: Track Information (Left 260px) */}
      <div className="flex items-center gap-3 w-64 min-w-[200px] overflow-hidden">
        <div className="w-11 h-11 rounded-xl bg-neutral-200 dark:bg-neutral-800 shadow-sm overflow-hidden relative flex-shrink-0 border border-black/5 dark:border-white/10">
          <img
            src={
              currentTrack?.pic ||
              "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=80"
            }
            alt={currentTrack?.name || "Album Art"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="overflow-hidden flex-1 min-w-0 pr-1">
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1.5">
            <span className="truncate">{currentTrack?.name || "未播放歌曲"}</span>
            {currentTrack && isPlaying && <AudioVisualizer isPlaying={isPlaying} className="flex-shrink-0" />}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {currentTrack ? `${currentTrack.artist}` : "从歌单挑选歌曲开始聆听"}
          </div>
        </div>
        {currentTrack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              toggleFavorite(currentTrack);
              if (isFav) {
                toast.info("已移出喜爱歌曲", currentTrack.name);
              } else {
                toast.success("已添加到喜爱歌曲", currentTrack.name);
              }
            }}
            className={`h-7 w-7 rounded-full flex-shrink-0 ${
              isFav ? "text-[#fa2d48]" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
          </Button>
        )}
      </div>

      {/* Cluster 2: Center Controls & Apple LCD Timeline Capsule (Center 440px) */}
      <div className="flex flex-col items-center gap-1 max-w-md w-full px-4">
        {/* Playback Button Group with Relaxed Spacing */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlayMode}
            className={`h-7 w-7 ${
              playMode !== "list-loop"
                ? "text-[#fa2d48]"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
            title={playMode === "single-loop" ? "单曲循环" : playMode === "shuffle" ? "随机播放" : "列表循环"}
          >
            {playMode === "single-loop" ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : playMode === "shuffle" ? (
              <Shuffle className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={prev}
            className="h-7 w-7 text-neutral-700 dark:text-neutral-200"
            title="上一首"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>

          <Button
            size="icon"
            variant="apple"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full shadow-md"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={next}
            className="h-7 w-7 text-neutral-700 dark:text-neutral-200"
            title="下一首"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
        </div>

        {/* Apple Sleek Scrubber Bar with Time Labels */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500 font-mono w-7 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-black/10 dark:bg-white/15 rounded-full relative group cursor-pointer overflow-hidden py-1 -my-1"
          >
            <div className="h-1 w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-800 dark:bg-neutral-200 group-hover:bg-[#fa2d48] rounded-full transition-colors"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </div>
          <span className="text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500 font-mono w-7 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Cluster 3: Secondary Controls & Volume (Right 260px) */}
      <div className="flex items-center justify-end gap-2 w-64 min-w-[200px]">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveView(activeView === "lyrics" ? "listen-now" : "lyrics")}
          className={`h-7 w-7 rounded-lg ${
            activeView === "lyrics"
              ? "text-[#fa2d48] bg-[#fa2d48]/12"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          }`}
          title="歌词舞台"
        >
          <Mic2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveView(activeView === "search" ? "listen-now" : "search")}
          className="h-7 w-7 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          title="搜索探索"
        >
          <ListMusic className="w-3.5 h-3.5" />
        </Button>

        {/* Compact Volume Control */}
        <div className="flex items-center gap-1.5 w-24 pl-1">
          <button
            onClick={toggleMute}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded-md"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <div
            ref={volumeRef}
            onClick={handleVolumeClick}
            className="flex-1 h-1 bg-black/10 dark:bg-white/15 rounded-full relative group cursor-pointer overflow-hidden py-1 -my-1"
          >
            <div className="h-1 w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-700 dark:bg-neutral-300 rounded-full"
                initial={false}
                animate={{ width: `${isMuted ? 0 : volume * 100}%` }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PlayerBar;
