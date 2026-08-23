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
  Airplay
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
    <footer className="h-20 w-full apple-player-glass fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-5 select-none">
      {/* Current Playing Track Info */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
        <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800 shadow-md overflow-hidden relative group border border-black/5 dark:border-white/10 flex-shrink-0">
          <img
            src={
              currentTrack?.pic ||
              "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=80"
            }
            alt={currentTrack?.name || "Album Art"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="overflow-hidden pr-2">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate hover:underline cursor-pointer">
            {currentTrack?.name || "未播放歌曲"}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate hover:underline cursor-pointer mt-0.5">
            {currentTrack ? `${currentTrack.artist} · ${currentTrack.album || "单曲"}` : "点击歌单或卡片开始聆听"}
          </div>
        </div>
        {currentTrack && (
          <button className="p-1.5 text-neutral-400 hover:text-[#fa2d48] transition-colors cursor-pointer">
            <Heart className="w-4 h-4 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Center Controls & Progress Bar */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayMode}
            className={`p-1.5 transition-colors cursor-pointer ${
              playMode === "shuffle"
                ? "text-[#fa2d48]"
                : "text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
            }`}
            title={
              playMode === "list-loop"
                ? "列表循环"
                : playMode === "single-loop"
                ? "单曲循环"
                : "随机播放"
            }
          >
            {playMode === "single-loop" ? (
              <Repeat1 className="w-4 h-4 text-[#fa2d48]" />
            ) : playMode === "shuffle" ? (
              <Shuffle className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={prev}
            className="p-1.5 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="上一首"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#fa2d48] hover:bg-[#ff3b56] text-white flex items-center justify-center shadow-lg shadow-[#fa2d48]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="p-1.5 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="下一首"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <div className="w-4" />
        </div>

        {/* Progress Timeline */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500 font-medium w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1.5 bg-black/10 dark:bg-white/15 rounded-full relative group cursor-pointer overflow-hidden"
          >
            <div
              className="h-full bg-[#fa2d48] rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500 font-medium w-9 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Controls (Volume, Airplay, Queue) */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        <button className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer">
          <Airplay className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer">
          <ListMusic className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 w-28">
          <button
            onClick={toggleMute}
            className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div
            ref={volumeRef}
            onClick={handleVolumeClick}
            className="flex-1 h-1.5 bg-black/10 dark:bg-white/15 rounded-full relative group cursor-pointer overflow-hidden"
          >
            <div
              className="h-full bg-neutral-700 dark:bg-neutral-200 rounded-full"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
