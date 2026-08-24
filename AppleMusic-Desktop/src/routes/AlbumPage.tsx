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
      <div className="space-y-8 animate-pulse max-w-5xl mx-auto pb-16">
        <div className="flex gap-6 items-end">
          <div className="w-52 h-52 rounded-3xl bg-black/5 dark:bg-white/5" />
          <div className="space-y-3 flex-1">
            <div className="w-24 h-4 bg-black/5 dark:bg-white/5 rounded" />
            <div className="w-64 h-8 bg-black/5 dark:bg-white/5 rounded-lg" />
            <div className="w-40 h-4 bg-black/5 dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-24 text-center text-neutral-400 space-y-2 max-w-md mx-auto">
        <Disc className="w-12 h-12 mx-auto opacity-20" />
        <div className="text-sm font-semibold">未找到专辑信息</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-300">
      {/* Bento Header */}
      <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row gap-7 items-center sm:items-end relative overflow-hidden">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-black/5 dark:border-white/10 relative">
          <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left relative z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="apple">录音室专辑</Badge>
            <Badge variant="secondary">无损音质 · ALAC 24-bit</Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold apple-title text-neutral-900 dark:text-white leading-tight">
            {album.name}
          </h1>

          <div className="text-xs text-[#86868b]">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{album.artist}</span> · {album.publishYear || "精选发行"} · 共 {tracks.length} 首歌曲
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <Button onClick={handlePlayAll} size="default" className="px-5 font-semibold text-xs h-8.5">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5 mr-1" /> 播放全部
            </Button>
            <Button onClick={handleShufflePlay} size="default" variant="secondary" className="px-4 font-semibold text-xs h-8.5">
              <Shuffle className="w-3.5 h-3.5 mr-1" /> 随机播放
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks Table in Bento Group */}
      <div className="inset-group divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between p-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-4">
          <div className="flex items-center gap-4">
            <span className="w-5 text-center">#</span>
            <span>歌曲标题</span>
          </div>
          <Clock className="w-3.5 h-3.5 mr-2" />
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
            const isFav = isFavorite(track.id);

            return (
              <motion.div key={track.id} variants={staggerItem}>
                <div
                  onClick={() => playTrack(track, tracks)}
                  className={`flex items-center justify-between px-4 py-3 transition-colors group cursor-pointer ${
                    isCurrent
                      ? "bg-[#FA2D48]/10 text-[#FA2D48]"
                      : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden pr-2">
                    <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                      {isCurrent && isPlaying ? (
                        <Volume2 className="w-3.5 h-3.5 text-[#FA2D48] animate-pulse" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="overflow-hidden">
                      <div className={`text-[13px] font-semibold truncate ${isCurrent ? "text-[#FA2D48]" : "group-hover:text-[#FA2D48]"}`}>
                        {track.name}
                      </div>
                      <div className="text-[11px] text-[#86868b] truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#86868b]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(track)}
                      className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                        isFav ? "text-[#FA2D48]" : "text-neutral-400 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                    </button>
                    <span className="tabular-nums font-mono text-[11px] w-12 text-right">
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
