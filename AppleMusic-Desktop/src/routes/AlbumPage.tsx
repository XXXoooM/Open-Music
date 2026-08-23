import React from "react";
import { Play, Shuffle, Heart, Clock, Disc, Volume2 } from "lucide-react";
import { useAlbum } from "@/hooks/useAlbum";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

interface AlbumPageProps {
  albumId?: string | null;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const AlbumPage: React.FC<AlbumPageProps> = ({ albumId }) => {
  const { data: album, isLoading } = useAlbum(albumId);
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();

  const tracks = album?.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
      toast.success("开始播放专辑", album?.name);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
      toast.success("随机播放专辑", album?.name);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto pb-16">
        <div className="flex gap-6 items-end">
          <div className="w-48 h-48 rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="space-y-3 flex-1">
            <div className="w-24 h-4 bg-black/5 dark:bg-white/5 rounded" />
            <div className="w-64 h-8 bg-black/5 dark:bg-white/5 rounded-lg" />
            <div className="w-40 h-4 bg-black/5 dark:bg-white/5 rounded" />
          </div>
        </div>
        <div className="space-y-2 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-24 text-center text-neutral-400 space-y-2 max-w-md mx-auto">
        <Disc className="w-12 h-12 mx-auto opacity-20" />
        <div className="text-sm font-semibold">未找到专辑信息</div>
        <div className="text-xs">请返回首页或搜索探索选择其他精选专辑</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-300">
      {/* iOS 27 / macOS Style Album Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end">
        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-black/5 dark:border-white/10">
          <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="apple">录音室专辑</Badge>
            <Badge variant="secondary">无损音质 · ALAC</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {album.name}
          </h1>

          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{album.artist}</span> · {album.publishYear || "精选发行"} · {tracks.length} 首歌曲
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
            <Button onClick={handlePlayAll} size="pill" className="px-5 font-semibold text-xs h-9">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5 mr-1.5" /> 播放全部
            </Button>
            <Button onClick={handleShufflePlay} size="pill" variant="glass" className="px-4 font-semibold text-xs h-9">
              <Shuffle className="w-3.5 h-3.5 mr-1.5" /> 随机播放
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks Table / List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] font-semibold text-neutral-400 px-3 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-5 text-center">#</span>
            <span>歌曲标题</span>
          </div>
          <div className="flex items-center gap-6">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-1">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
            const isFav = isFavorite(track.id);

            return (
              <motion.div key={track.id} variants={staggerItem}>
                <div
                  onClick={() => playTrack(track, tracks)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${
                    isCurrent
                      ? "bg-[#fa2d48]/10 text-[#fa2d48]"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden pr-2">
                    <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                      {isCurrent && isPlaying ? (
                        <Volume2 className="w-3.5 h-3.5 text-[#fa2d48] animate-pulse" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="overflow-hidden">
                      <div className={`text-xs font-semibold truncate ${isCurrent ? "text-[#fa2d48]" : "group-hover:text-[#fa2d48]"}`}>
                        {track.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(track)}
                      className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                        isFav ? "text-[#fa2d48]" : "text-neutral-400 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                    </button>
                    <span className="tabular-nums font-mono text-[11px] w-10 text-right">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default AlbumPage;
