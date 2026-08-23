import React from "react";
import { Play, Shuffle, Heart, Disc3, Users, Volume2 } from "lucide-react";
import { useArtist } from "@/hooks/useArtist";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

interface ArtistPageProps {
  artistId?: string | null;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ArtistPage: React.FC<ArtistPageProps> = ({ artistId }) => {
  const { data: artist, isLoading } = useArtist(artistId);
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { toggleFavorite, isFavorite, setActiveView } = usePlaylistStore();

  const topTracks = artist?.topTracks || [];
  const albums = artist?.albums || [];

  const handlePlayAll = () => {
    if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks);
      toast.success("开始播放艺人热门单曲", artist?.name);
    }
  };

  const handleShufflePlay = () => {
    if (topTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * topTracks.length);
      playTrack(topTracks[randomIndex], topTracks);
      toast.success("随机播放艺人单曲", artist?.name);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse max-w-5xl mx-auto pb-16">
        <div className="h-56 rounded-3xl bg-black/5 dark:bg-white/5" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="py-24 text-center text-neutral-400 space-y-2 max-w-md mx-auto">
        <Disc3 className="w-12 h-12 mx-auto opacity-20" />
        <div className="text-sm font-semibold">艺人信息不存在</div>
        <div className="text-xs">请返回搜索探索其他华语或欧美艺人</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-300">
      {/* iOS 27 Artist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl p-8 flex flex-col justify-end min-h-[220px] bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        <img
          src={artist.cover}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover -z-10 brightness-75"
        />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <Badge variant="apple" className="bg-[#fa2d48]/80 text-white border-0">认证音乐人</Badge>
            <span className="text-xs text-white/80 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> 空间音频精选
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            {artist.name}
          </h1>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handlePlayAll} size="pill" className="px-5 font-semibold text-xs h-9 bg-white text-black hover:bg-white/90 shadow-md">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5 mr-1.5" /> 播放热门
            </Button>
            <Button onClick={handleShufflePlay} size="pill" variant="glass" className="px-4 font-semibold text-xs h-9 bg-white/20 hover:bg-white/30 text-white border-white/20">
              <Shuffle className="w-3.5 h-3.5 mr-1.5" /> 随机播放
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Tracks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            热门曲目
          </h2>
          <span className="text-xs text-neutral-400">共 {topTracks.length} 首</span>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-1">
          {topTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
            const isFav = isFavorite(track.id);

            return (
              <motion.div key={track.id} variants={staggerItem}>
                <div
                  onClick={() => playTrack(track, topTracks)}
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
                      <div className="text-[11px] text-neutral-400 truncate">{track.album || "精选单曲"}</div>
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

      {/* Albums Grid Section */}
      {albums.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            专辑与精选集
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <Card
                key={album.id}
                onClick={() => setActiveView("album", album.id)}
                className="group cursor-pointer p-2 border-0 bg-transparent shadow-none space-y-2"
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300 relative">
                  <img src={album.cover} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold truncate group-hover:text-[#fa2d48] transition-colors">{album.name}</h3>
                  <p className="text-[11px] text-neutral-400 truncate">{album.publishYear || "专辑"}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
