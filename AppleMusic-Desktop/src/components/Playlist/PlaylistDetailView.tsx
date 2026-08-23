import React from "react";
import { Play, Shuffle, Heart, Music } from "lucide-react";
import { Playlist } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";

interface PlaylistDetailViewProps {
  playlist: Playlist;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist }) => {
  const { playTrack, currentTrack } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();

  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Playlist Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 shadow-lg">
        <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-black/10 dark:border-white/15">
          <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1">
          <span className="text-xs font-bold text-[#fa2d48] uppercase tracking-wider">
            歌单 · Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {playlist.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl line-clamp-2">
            {playlist.description || "Apple Music 推荐歌单，精选全球动人旋律。"}
          </p>
          <div className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-3 pt-1">
            <span>{playlist.creator?.nickname || "自建歌单"}</span>
            <span>•</span>
            <span>共 {tracks.length} 首曲目</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#fa2d48]/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" /> 播放全部
            </button>
            <button
              onClick={handleShuffleAll}
              disabled={tracks.length === 0}
              className="px-5 py-2.5 rounded-full apple-glass hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" /> 随机播放
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="space-y-2">
        {tracks.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-2">
            <Music className="w-10 h-10 mx-auto opacity-30" />
            <div className="text-sm font-medium">歌单内暂无曲目</div>
            <div className="text-xs">可通过搜索或发现页面点击「+」将歌曲添加到此歌单</div>
          </div>
        ) : (
          <div className="rounded-2xl apple-glass border border-black/5 dark:border-white/5 overflow-hidden">
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, tracks)}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-black/[0.04] dark:border-white/[0.04] last:border-none ${
                    isCurrent ? "bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden pr-4 flex-1">
                    <span className="text-xs font-semibold text-neutral-400 w-6 text-center tabular-nums">
                      {idx + 1}
                    </span>
                    <img
                      src={track.pic}
                      alt={track.name}
                      className="w-10 h-10 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div
                        className={`text-sm font-semibold truncate transition-colors ${
                          isCurrent ? "text-[#fa2d48]" : "group-hover:text-[#fa2d48]"
                        }`}
                      >
                        {track.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 hidden sm:block w-40 truncate">
                    {track.album || "单曲"}
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(track)}
                      className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                        isFav ? "text-[#fa2d48]" : "text-neutral-400"
                      }`}
                      title={isFav ? "取消喜爱" : "添加到喜爱歌曲"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                    </button>
                    <span className="text-xs tabular-nums text-neutral-400 w-10 text-right">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toFixed(0).padStart(2, "0")}` : "--:--"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
