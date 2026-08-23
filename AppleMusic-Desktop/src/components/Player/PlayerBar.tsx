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
  Airplay,
  Mic2
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Button } from "@/components/ui/button";

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

  const { activeView, setActiveView } = usePlaylistStore();

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
        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 shadow-md overflow-hidden relative group border border-black/5 dark:border-white/10 flex-shrink-0">
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
          <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-[#fa2d48]">
            <Heart className="w-4 h-4 stroke-[2]" />
          </Button>
        )}
      </div>

      {/* Center Controls & Progress Bar */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5 px-4">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlayMode}
            className={`h-8 w-8 ${
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
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={prev}
            className="h-8 w-8 text-neutral-700 dark:text-neutral-200"
            title="上一首"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button
            size="icon"
            variant="apple"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={next}
            className="h-8 w-8 text-neutral-700 dark:text-neutral-200"
            title="下一首"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>

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

      {/* Right Controls (Lyrics Mic, Volume, Airplay, Queue) */}
      <div className="flex items-center justify-end gap-1.5 w-1/4 min-w-[220px]">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveView(activeView === "lyrics" ? "listen-now" : "lyrics")}
          className={`h-8 w-8 rounded-lg ${
            activeView === "lyrics"
              ? "text-[#fa2d48] bg-[#fa2d48]/15"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          }`}
          title="沉浸式动态歌词舞台"
        >
          <Mic2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-neutral-800 dark:hover:text-white">
          <Airplay className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-neutral-800 dark:hover:text-white">
          <ListMusic className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 w-28 pl-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="h-7 w-7 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
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
