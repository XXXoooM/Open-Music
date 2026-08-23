import React from "react";
import { Play, Shuffle, Heart, Disc3, CheckCircle, Users, Volume2, ArrowRight } from "lucide-react";
import { useArtist } from "@/hooks/useArtist";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";

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
    }
  };

  const handleShufflePlay = () => {
    if (topTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * topTracks.length);
      playTrack(topTracks[randomIndex], topTracks);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-black/10 dark:bg-white/10" />
        <div className="space-y-3">
          <div className="w-36 h-6 bg-black/10 dark:bg-white/10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-400">
        <Disc3 className="w-12 h-12 opacity-30" />
        <h2 className="text-lg font-bold">艺人信息不存在</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 sm:p-2 animate-in fade-in duration-300">
      {/* Artist Hero Header */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-6 sm:p-10 text-white select-none">
        {/* Background Image / Backdrop */}
        <div className="absolute inset-0 -z-10">
          <img
            src={artist.cover}
            alt={artist.name}
            className="w-full h-full object-cover brightness-[0.65] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Artist Header Info */}
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            {artist.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-md text-[11px] font-semibold tracking-wide">
                <CheckCircle className="w-3 h-3" /> 认证艺人
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-white/90">
              <Users className="w-3 h-3" /> {artist.monthlyListeners ? `${artist.monthlyListeners} 月度听众` : "热门艺人"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {artist.name}
          </h1>

          {artist.bio && (
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed max-w-xl">
              {artist.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              disabled={topTracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#fa2d48]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" /> 播放热门歌曲
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={topTracks.length === 0}
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" /> 随机播放
            </button>
          </div>
        </div>
      </section>

      {/* Top 5 Songs Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            热门歌曲 Top 5
          </h2>
          <span className="text-xs text-neutral-400 font-medium">官方精选热播</span>
        </div>

        <div className="rounded-2xl apple-glass border border-black/5 dark:border-white/5 overflow-hidden">
          {topTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
            const isFav = isFavorite(track.id);

            return (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, topTracks)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-black/[0.04] dark:border-white/[0.04] last:border-none ${
                  isCurrent
                    ? "bg-[#fa2d48]/10 text-[#fa2d48] font-semibold"
                    : "text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 overflow-hidden pr-4">
                  <span className="text-xs font-semibold text-neutral-400 w-6 text-center tabular-nums">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-[#fa2d48] animate-pulse mx-auto" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <img
                    src={track.pic}
                    alt={track.name}
                    className="w-10 h-10 rounded-lg object-cover shadow-sm flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className={`text-sm truncate ${isCurrent ? "text-[#fa2d48] font-bold" : "group-hover:text-[#fa2d48]"}`}>
                      {track.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {track.album || "精选单曲"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(track)}
                    className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                      isFav ? "text-[#fa2d48]" : "text-neutral-400 opacity-0 group-hover:opacity-100"
                    }`}
                    title={isFav ? "取消喜爱" : "添加到喜爱"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-xs tabular-nums text-neutral-400 w-12 text-right">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Albums Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            全部专辑
          </h2>
          <span className="text-xs text-neutral-400 font-medium">共 {albums.length} 张录音室专辑</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {albums.map((album, idx) => (
            <div
              key={album.id + idx}
              onClick={() => setActiveView("album", album.id)}
              className="group cursor-pointer space-y-2"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative shadow-md group-hover:shadow-xl transition-all duration-300 border border-black/5 dark:border-white/10">
                <img
                  src={album.cover}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold truncate group-hover:text-[#fa2d48] transition-colors text-neutral-900 dark:text-neutral-100">
                  {album.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {album.publishYear ? `${album.publishYear} · 专辑` : "录音室专辑"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default ArtistPage;
