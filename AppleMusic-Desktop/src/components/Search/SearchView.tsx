import React, { useState } from "react";
import { Search, Play, Heart, Plus, Music, Sparkles, TrendingUp } from "lucide-react";
import { Track } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useSettingsStore, MusicServer, ApiSource } from "@/stores/settingsStore";
import { searchOnlineTracks } from "@/api/musicClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

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
              <Button
                size="sm"
                variant={apiSource === "qijieya" ? "default" : "ghost"}
                onClick={() => handleSourceChange("qijieya")}
                className="h-7 px-2.5 text-xs rounded-lg"
              >
                祈杰VIP源
              </Button>
              <Button
                size="sm"
                variant={apiSource === "mikus" ? "default" : "ghost"}
                onClick={() => handleSourceChange("mikus")}
                className="h-7 px-2.5 text-xs rounded-lg"
              >
                Mikus官方源
              </Button>
            </div>

            <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 text-xs">
              <Button
                size="sm"
                variant={musicServer === "netease" ? "destructive" : "ghost"}
                onClick={() => handleServerChange("netease")}
                className="h-7 px-2.5 text-xs rounded-lg"
              >
                网易云
              </Button>
              <Button
                size="sm"
                variant={musicServer === "tencent" ? "default" : "ghost"}
                onClick={() => handleServerChange("tencent")}
                className={`h-7 px-2.5 text-xs rounded-lg ${musicServer === "tencent" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
              >
                QQ音乐
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索歌曲、艺人、专辑（支持网易云 / QQ音乐多源实时搜索）..."
            className="h-12 pl-12 pr-28 rounded-2xl text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSearching}
            className="absolute right-2 rounded-xl"
          >
            {isSearching ? "正在检索..." : "探索"}
          </Button>
        </form>

        {/* Hot Search Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#fa2d48]" /> 热门探索：
          </span>
          {POPULAR_TAGS.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="secondary"
              onClick={() => handleTagClick(tag)}
              className="h-7 px-3 rounded-full text-xs"
            >
              {tag}
            </Button>
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {results.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <motion.div key={track.id + idx} variants={staggerItem}>
                  <Card
                    enableHover
                    onClick={() => playTrack(track, results)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all group cursor-pointer ${
                      isCurrent
                        ? "border-[#fa2d48]/40 bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                        : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10"
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
                        className={`h-8 w-8 rounded-full ${
                          isFav ? "text-[#fa2d48]" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        }`}
                        title={isFav ? "取消喜爱" : "添加到喜爱歌曲"}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                      </Button>

                      {customPlaylists.length > 0 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            addTrackToPlaylist(customPlaylists[0].id, track);
                            toast.success(`已添加到歌单「${customPlaylists[0].title}」`, track.name);
                          }}
                          className="h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                          title={`添加到歌单: ${customPlaylists[0].title}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="apple"
                        onClick={() => playTrack(track, results)}
                        className="w-8 h-8 rounded-full ml-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
