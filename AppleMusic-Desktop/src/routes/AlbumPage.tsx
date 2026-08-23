import React from "react";
import { Play, Shuffle, Heart, Music, Clock, Disc, Volume2 } from "lucide-react";
import { useAlbum } from "@/hooks/useAlbum";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";

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
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="flex gap-8 items-end">
          <div className="w-56 h-56 rounded-3xl bg-black/10 dark:bg-white/10" />
          <div className="space-y-3 flex-1">
            <div className="w-24 h-4 bg-black/10 dark:bg-white/10 rounded" />
            <div className="w-64 h-8 bg-black/10 dark:bg-white/10 rounded-lg" />
            <div className="w-40 h-4 bg-black/10 dark:bg-white/10 rounded" />
            <div className="w-32 h-10 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
        </div>
        <div className="space-y-3 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-400">
        <Disc className="w-12 h-12 opacity-30" />
        <h2 className="text-lg font-bold">专辑不存在或已下架</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 sm:p-2 animate-in fade-in duration-300">
      {/* Album Header Banner */}
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-7 p-6 sm:p-8 rounded-3xl apple-glass border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
        {/* Ambient Blur Backdrop */}
        <div
          className="absolute -right-20 -bottom-20 w-80 h-80 opacity-30 blur-3xl pointer-events-none -z-10 rounded-full"
          style={{ backgroundImage: `radial-gradient(circle, #fa2d48, transparent)` }}
        />

        {/* Large Album Artwork */}
        <div className="w-48 sm:w-56 h-48 sm:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-black/10 dark:border-white/15 group relative">
          <img src={album.cover} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handlePlayAll}
              className="w-12 h-12 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-3.5 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-bold text-[#fa2d48] bg-[#fa2d48]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              专辑 · Album
            </span>
            <span className="text-xs text-neutral-400 font-medium">无损高保真 · 杜比全景声</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {album.name}
          </h1>

          <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:text-[#fa2d48] transition-colors cursor-pointer inline-block">
            {album.artist}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl line-clamp-2 leading-relaxed">
            {album.description}
          </p>

          <div className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-3 pt-0.5">
            <span>{album.publishYear || "2004"} 年发行</span>
            <span>•</span>
            <span>共 {tracks.length} 首歌曲</span>
            {album.company && (
              <>
                <span>•</span>
                <span className="truncate max-w-[160px]">{album.company}</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#fa2d48]/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" /> 播放全部
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="px-5 py-2.5 rounded-full apple-glass hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" /> 随机播放
            </button>
          </div>
        </div>
      </section>

      {/* Tracks Table */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          <span className="w-8">#</span>
          <span className="flex-1">歌曲标题</span>
          <span className="w-16 text-right flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" /> 时长
          </span>
        </div>

        <div className="rounded-2xl apple-glass border border-black/5 dark:border-white/5 overflow-hidden">
          {tracks.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Music className="w-8 h-8 mx-auto opacity-30" />
              <div className="text-sm">暂无歌曲信息</div>
            </div>
          ) : (
            tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <div
                  key={track.id + idx}
                  onClick={() => playTrack(track, tracks)}
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
                    <div className="overflow-hidden">
                      <div className={`text-sm truncate ${isCurrent ? "text-[#fa2d48] font-bold" : "group-hover:text-[#fa2d48]"}`}>
                        {track.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {track.artist}
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
            })
          )}
        </div>
      </section>
    </div>
  );
};
export default AlbumPage;
