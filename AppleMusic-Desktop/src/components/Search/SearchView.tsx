import React, { useState } from "react";
import { Search, Play, Pause, Heart, Plus, Music, Sparkles, TrendingUp, Volume2 } from "lucide-react";
import { Track } from "@/types/music";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useSettingsStore, MusicServer, ApiSource } from "@/stores/settingsStore";
import { searchOnlineTracks } from "@/api/musicClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SegmentedTabs } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

const POPULAR_TAGS = ["周杰伦", "Taylor Swift", "The Weeknd", "林俊杰", "陈奕迅", "空间音频", "华语经典", "爵士微醺"];

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

  const handleServerChange = (server: string) => {
    const s = server as MusicServer;
    setMusicServer(s);
    performSearch(keyword, s);
  };

  const handleSourceChange = (src: string) => {
    const s = src as ApiSource;
    setApiSource(s);
    performSearch(keyword, musicServer, s);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-300">
      {/* Search Header & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              搜索探索
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              跨源实时检索网易云与 QQ 音乐高保真曲库
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedTabs
              value={apiSource}
              onValueChange={handleSourceChange}
              items={[
                { value: "qijieya", label: "祈杰 VIP源" },
                { value: "mikus", label: "Mikus 官方源" },
              ]}
            />
            <SegmentedTabs
              value={musicServer}
              onValueChange={handleServerChange}
              items={[
                { value: "netease", label: "网易云" },
                { value: "tencent", label: "QQ 音乐" },
              ]}
            />
          </div>
        </div>

        {/* Large Apple Search Input */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索歌曲、艺人、专辑..."
            className="h-11 pl-11 pr-24 rounded-2xl text-xs glass border-black/10 dark:border-white/10"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSearching}
            className="absolute right-1.5 h-8 px-4 rounded-xl text-xs"
          >
            {isSearching ? "检索中..." : "搜索"}
          </Button>
        </form>

        {/* Hot Search Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#fa2d48]" /> 热门搜索：
          </span>
          {POPULAR_TAGS.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="ghost"
              onClick={() => handleTagClick(tag)}
              className="h-6 px-2.5 rounded-full text-xs bg-black/[0.03] dark:bg-white/[0.05] hover:bg-[#fa2d48]/10 hover:text-[#fa2d48] text-neutral-600 dark:text-neutral-300"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fa2d48]" />
            {isSearching ? "正在连接云端多线路搜索..." : `搜索匹配结果 (${results.length})`}
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {apiSource === "qijieya" ? "祈杰 VIP 解析" : "Mikus 镜像"} · {musicServer === "netease" ? "网易云" : "QQ 音乐"}
          </span>
        </div>

        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 space-y-2">
            <Music className="w-10 h-10 mx-auto opacity-20" />
            <div className="text-sm font-medium">
              {hasSearched ? "未找到相关音乐结果" : "输入关键词或点击上方热门标签开始探索"}
            </div>
            <div className="text-xs text-neutral-500">支持网易云与 QQ 音乐双源自动解析与高保真流媒体加载</div>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-2.5"
          >
            {results.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              const isFav = isFavorite(track.id);

              return (
                <motion.div key={track.id + idx} variants={staggerItem}>
                  <Card
                    onClick={() => playTrack(track, results)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group cursor-pointer ${
                      isCurrent
                        ? "border-[#fa2d48]/40 bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10 shadow-sm"
                        : "border-black/[0.04] dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] hover:bg-white/90 dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                        {isCurrent && isPlaying ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#fa2d48] animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <img
                        src={track.pic}
                        alt={track.name}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                        variant="default"
                        onClick={() => {
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            playTrack(track, results);
                          }
                        }}
                        className={`w-8 h-8 rounded-full ml-0.5 transition-all ${
                          isCurrent
                            ? "bg-[#fa2d48] text-white hover:bg-[#fa2d48]/90 shadow-md shadow-[#fa2d48]/30"
                            : "bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-[#fa2d48] hover:text-white"
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
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

export default SearchView;
