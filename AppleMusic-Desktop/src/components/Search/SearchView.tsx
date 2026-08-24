import React, { useState } from "react";
import { Search, Play, Pause, Heart, Plus, Sparkles, TrendingUp, Volume2, Compass } from "lucide-react";
import { Track } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useSettingsStore, MusicServer, ApiSource } from "@/stores/settingsStore";
import { searchOnlineTracks } from "@/api/musicClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedTabs } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

const POPULAR_TAGS = ["周杰伦", "Taylor Swift", "The Weeknd", "林俊杰", "陈奕迅", "空间音频", "华语经典", "爵士微醺"];

const DISCOVERY_CATEGORIES = [
  { title: "华语流行", subtitle: "Mandopop Hits", gradient: "from-rose-500 to-red-600", query: "华语流行" },
  { title: "欧美金曲", subtitle: "Global Pop", gradient: "from-blue-600 to-indigo-700", query: "欧美流行" },
  { title: "杜比全景声", subtitle: "Spatial Audio", gradient: "from-purple-600 to-pink-600", query: "空间音频" },
  { title: "微醺爵士", subtitle: "Late Night Jazz", gradient: "from-amber-600 to-orange-700", query: "爵士" },
  { title: "嘻哈潮流", subtitle: "Hip-Hop & Rap", gradient: "from-emerald-600 to-teal-700", query: "说唱" },
  { title: "影视原声", subtitle: "OST & Soundtracks", gradient: "from-cyan-600 to-blue-700", query: "影视原声" },
  { title: "电子律动", subtitle: "Electronic Dance", gradient: "from-fuchsia-600 to-purple-800", query: "电子音乐" },
  { title: "ACG 动漫", subtitle: "Anime & Gaming", gradient: "from-pink-500 to-rose-600", query: "动漫原声" },
];

export const SearchView: React.FC = () => {
  const { playTrack, togglePlay, currentTrack, isPlaying } = usePlayerStore();
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
      const data = await searchOnlineTracks(trimmed, src, server, 24);
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

  const handleCategoryClick = (query: string) => {
    setKeyword(query);
    performSearch(query);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-300 min-w-0">
      {/* Search Header & Controls */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold apple-title text-neutral-900 dark:text-white">
              搜索探索
            </h1>
            <p className="apple-caption mt-0.5">
              跨源实时检索网易云与 QQ 音乐千万级高保真母带曲库
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <SegmentedTabs
              layoutId="search-api-source-pill"
              value={apiSource}
              onValueChange={(s) => {
                const src = s as ApiSource;
                setApiSource(src);
                performSearch(keyword, musicServer, src);
              }}
              items={[
                { value: "qijieya", label: "祈杰 VIP" },
                { value: "mikus", label: "Mikus 官方" },
              ]}
            />
            <SegmentedTabs
              layoutId="search-music-server-pill"
              value={musicServer}
              onValueChange={(s) => {
                const srv = s as MusicServer;
                setMusicServer(srv);
                performSearch(keyword, srv);
              }}
              items={[
                { value: "netease", label: "网易云" },
                { value: "tencent", label: "QQ 音乐" },
              ]}
            />
          </div>
        </div>

        {/* Large Apple Search Bar */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-[#86868b] absolute left-4 pointer-events-none" />
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索歌曲、艺人、专辑或歌单..."
            className="h-11 pl-11 pr-24 rounded-2xl text-xs bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] shadow-sm"
          />
          <Button
            type="submit"
            size="default"
            disabled={isSearching}
            className="absolute right-1.5 h-8 px-4 rounded-xl text-xs font-semibold"
          >
            {isSearching ? "检索中..." : "搜索"}
          </Button>
        </form>

        {/* Hot Search Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#86868b] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#FA2D48]" /> 热门搜索：
          </span>
          {POPULAR_TAGS.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="secondary"
              onClick={() => handleTagClick(tag)}
              className="h-6 px-3 rounded-full text-xs font-medium flex-shrink-0"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Discovery Bento Categories */}
      {(!hasSearched || results.length === 0) && !isSearching && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold apple-title flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FA2D48]" /> 浏览分类 (Browse by Category)
            </h2>
            <span className="apple-caption">探索海量主题风格</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DISCOVERY_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.query)}
                className={`h-24 rounded-2xl p-4 bg-gradient-to-br ${cat.gradient} text-white shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none`}
              >
                <div className="relative z-10 min-w-0">
                  <h3 className="text-sm font-bold tracking-tight truncate">{cat.title}</h3>
                  <p className="text-[10px] text-white/80 font-medium truncate">{cat.subtitle}</p>
                </div>
                <div className="self-end relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold apple-title flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FA2D48] flex-shrink-0" />
            {isSearching ? "正在连接云端多线路搜索..." : `搜索匹配结果 (${results.length})`}
          </h2>
          <span className="apple-caption font-mono">
            {apiSource === "qijieya" ? "祈杰 VIP 解析" : "Mikus 官方镜像"} · {musicServer === "netease" ? "网易云" : "QQ 音乐"}
          </span>
        </div>

        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {results.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <motion.div key={track.id + idx} variants={staggerItem} className="min-w-0">
                  <div
                    onClick={() => playTrack(track, results)}
                    className={`bento-card flex items-center justify-between p-3 transition-all group cursor-pointer overflow-hidden ${
                      isCurrent
                        ? "ring-2 ring-[#FA2D48]/40 bg-[#FA2D48]/5 dark:bg-[#FA2D48]/10 shadow-sm"
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 pr-2">
                      <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums flex-shrink-0">
                        {isCurrent && isPlaying ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#FA2D48] animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <img
                        src={track.pic}
                        alt={track.name}
                        className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                      />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <div
                          className={`text-sm font-semibold truncate transition-colors ${
                            isCurrent ? "text-[#FA2D48]" : "group-hover:text-[#FA2D48]"
                          }`}
                        >
                          {track.name}
                        </div>
                        <div className="apple-caption truncate">
                          {track.artist} · {track.album || "在线音乐"}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          toggleFavorite(track);
                          if (isFav) {
                            toast.info("已移出喜爱歌曲", track.name);
                          } else {
                            toast.success("已添加到喜爱歌曲", track.name);
                          }
                        }}
                        className={`h-7.5 w-7.5 flex-shrink-0 ${isFav ? "text-[#FA2D48]" : "text-neutral-400"}`}
                        title={isFav ? "取消喜爱" : "添加到喜爱歌曲"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                      </Button>

                      {customPlaylists.length > 0 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            addTrackToPlaylist(customPlaylists[0].id, track);
                            toast.success(`已添加到歌单「${customPlaylists[0].title}」`, track.name);
                          }}
                          className="h-7.5 w-7.5 text-neutral-400 flex-shrink-0"
                          title={`添加到歌单: ${customPlaylists[0].title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant={isCurrent ? "default" : "secondary"}
                        onClick={() => {
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            playTrack(track, results);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex-shrink-0 ${isCurrent ? "shadow-md shadow-[#FA2D48]/30" : ""}`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}
      </section>
    </div>
  );
};

export default SearchView;
