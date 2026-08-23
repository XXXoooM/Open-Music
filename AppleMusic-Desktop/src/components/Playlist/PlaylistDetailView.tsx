import React from "react";
import { Play, Shuffle, Heart, Clock, Volume2, ListMusic } from "lucide-react";
import { Playlist } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

interface PlaylistDetailViewProps {
  playlist: Playlist;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();

  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
      toast.success("开始播放歌单", playlist.title);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
      toast.success("随机播放歌单", playlist.title);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-300">
      {/* Playlist Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
        <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-black/10 dark:border-white/15">
          <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-2.5 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="apple">精品歌单</Badge>
            <span className="text-xs text-neutral-400 font-medium">共 {tracks.length} 首曲目</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {playlist.title}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl line-clamp-2">
            {playlist.description || "Apple Music 推荐歌单，精选全球动人旋律。"}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
            <Button onClick={handlePlayAll} disabled={tracks.length === 0} size="pill" className="px-5 font-semibold text-xs h-9">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5 mr-1.5" /> 播放全部
            </Button>
            <Button onClick={handleShuffleAll} disabled={tracks.length === 0} size="pill" variant="glass" className="px-4 font-semibold text-xs h-9">
              <Shuffle className="w-3.5 h-3.5 mr-1.5" /> 随机播放
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
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

        {tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 space-y-2">
            <ListMusic className="w-10 h-10 mx-auto opacity-20" />
            <div className="text-sm font-semibold">歌单暂无歌曲</div>
            <div className="text-xs">在搜索探索页面点击「+」即可添加歌曲到本歌单</div>
          </div>
        ) : (
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
                    <div className="flex items-center gap-3.5 overflow-hidden pr-2">
                      <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                        {isCurrent && isPlaying ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#fa2d48] animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <img src={track.pic} alt={track.name} className="w-9 h-9 rounded-lg object-cover shadow-sm flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className={`text-xs font-semibold truncate ${isCurrent ? "text-[#fa2d48]" : "group-hover:text-[#fa2d48]"}`}>
                          {track.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {track.artist} · {track.album || "单曲精选"}
                        </div>
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
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailView;
