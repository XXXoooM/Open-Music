import React, { useState } from "react";
import { Search, Play, Heart, Plus, Music, Sparkles, TrendingUp } from "lucide-react";
import { Track } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useSettingsStore, MusicServer, ApiSource } from "@/stores/settingsStore";
import { searchOnlineTracks } from "@/api/musicClient";

const POPULAR_TAGS = ["周杰伦", "Taylor Swift", "The Weeknd", "林俊杰", "陈奕迅", "空间音频", "华语经典", "爵士微醺"];

export const SearchView: React.FC = () => {
  const { playTrack, currentTrack } = usePlayerStore();
  const { toggleFavorite, isFavorite, customPlaylists, addTrackToPlaylist } = usePlaylistStore();
  const { apiSource, musicServer, setMusicServer, setApiSource } = useSettingsStore();

  const [keyword, setKeyword] = useState<string>("周杰伦");
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const performSearch = async (kw: string, server: MusicServer = musicServer, src: ApiSource = apiSource) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchOnlineTracks(trimmed, src, server, 25);
      setResults(data);
    } catch (e) {
      console.warn("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keyword);
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    performSearch(tag);
  };

  const handleServerChange = (server: MusicServer) => {
    setMusicServer(server);
    performSearch(keyword, server);
  };

  const handleSourceChange = (src: ApiSource) => {
    setApiSource(src);
    performSearch(keyword, musicServer, src);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Header and Input */}
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">探索音乐世界</h1>

          {/* Route & Platform Selector Chips */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 text-xs">
              <button
                onClick={() => handleSourceChange("qijieya")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  apiSource === "qijieya"
                    ? "bg-[#fa2d48] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                }`}
              >
                祈杰VIP源
              </button>
              <button
                onClick={() => handleSourceChange("mikus")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  apiSource === "mikus"
                    ? "bg-[#fa2d48] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                }`}
              >
                Mikus官方源
              </button>
            </div>

            <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 text-xs">
              <button
                onClick={() => handleServerChange("netease")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  musicServer === "netease"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                }`}
              >
                网易云
              </button>
              <button
                onClick={() => handleServerChange("tencent")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  musicServer === "tencent"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                }`}
              >
                QQ音乐
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索歌曲、艺人、专辑（支持网易云 / QQ音乐多源实时搜索）..."
            className="w-full h-12 pl-12 pr-28 rounded-2xl apple-glass border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-[#fa2d48] focus:ring-2 focus:ring-[#fa2d48]/20 transition-all text-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-4 py-1.5 rounded-xl bg-[#fa2d48] text-white text-xs font-semibold hover:bg-[#ff3b56] transition-colors cursor-pointer shadow-md shadow-[#fa2d48]/20 disabled:opacity-50"
          >
            {isSearching ? "正在检索..." : "探索"}
          </button>
        </form>

        {/* Hot Search Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#fa2d48]" /> 热门探索：
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fa2d48]" />
            {isSearching ? "正在连接云端多线路搜索..." : `搜索匹配结果 (${results.length})`}
          </h2>
          <span className="text-xs text-neutral-400">
            数据源: {apiSource === "qijieya" ? "祈杰源 (支持VIP)" : "Mikus官方源"} · {musicServer === "netease" ? "网易云音乐" : "QQ音乐"}
          </span>
        </div>

        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-2">
            <Music className="w-10 h-10 mx-auto opacity-30" />
            <div className="text-sm font-medium">
              {hasSearched ? "未找到相关音乐结果" : "输入关键词或点击热门标签探索音乐"}
            </div>
            <div className="text-xs">支持网易云与QQ音乐双源自动解析播放</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <div
                  key={track.id + idx}
                  onClick={() => playTrack(track, results)}
                  className={`flex items-center justify-between p-3 rounded-2xl apple-glass hover:bg-black/5 dark:hover:bg-white/10 transition-all group cursor-pointer border ${
                    isCurrent
                      ? "border-[#fa2d48]/40 bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                      : "border-black/5 dark:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden pr-2">
                    <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                      {idx + 1}
                    </span>
                    <img
                      src={track.pic}
                      alt={track.name}
                      className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
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
                        {track.artist} · {track.album || "在线音乐"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(track)}
                      className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                        isFav ? "text-[#fa2d48]" : "text-neutral-400"
                      }`}
                      title={isFav ? "取消喜爱" : "添加到喜爱歌曲"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                    </button>

                    {customPlaylists.length > 0 && (
                      <button
                        onClick={() => addTrackToPlaylist(customPlaylists[0].id, track)}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
                        title={`添加到歌单: ${customPlaylists[0].title}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => playTrack(track, results)}
                      className="w-8 h-8 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer ml-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
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
