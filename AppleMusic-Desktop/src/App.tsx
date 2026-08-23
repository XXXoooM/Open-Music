import { useEffect } from "react";
import { TitleBar } from "@/components/TitleBar/TitleBar";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { PlayerBar } from "@/components/Player/PlayerBar";
import { SearchView } from "@/components/Search/SearchView";
import { PlaylistDetailView } from "@/components/Playlist/PlaylistDetailView";
import { LyricsPage } from "@/routes/LyricsPage";
import { AlbumPage } from "@/routes/AlbumPage";
import { ArtistPage } from "@/routes/ArtistPage";
import { ProfilePage } from "@/routes/ProfilePage";
import { SettingsPage } from "@/routes/SettingsPage";
import { usePlaylistQuery } from "@/hooks/useMusicQuery";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Play, Pause, Sparkles, Flame, Disc3, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/motion";

export function App() {
  const { data: spatialPlaylist, isLoading } = usePlaylistQuery("spatial-top");
  const { currentTrack, isPlaying, playTrack, togglePlay, initAudio } = usePlayerStore();
  const {
    activeView,
    selectedPlaylistId,
    selectedAlbumId,
    selectedArtistId,
    customPlaylists,
    favoriteTracks,
    setActiveView,
  } = usePlaylistStore();

  // Phase 5 System Integrations
  useMediaSession();
  useKeyboardShortcuts();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const handleHeroPlay = () => {
    if (spatialPlaylist?.tracks && spatialPlaylist.tracks.length > 0) {
      if (currentTrack && isPlaying) {
        togglePlay();
      } else if (currentTrack && !isPlaying) {
        togglePlay();
      } else {
        playTrack(spatialPlaylist.tracks[0], spatialPlaylist.tracks);
      }
    }
  };

  const currentDetailPlaylist =
    activeView === "favorites"
      ? {
          id: "favorites",
          title: "喜爱歌曲",
          description: "你点亮红心收藏的所有珍藏曲目。",
          cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
          trackCount: favoriteTracks.length,
          tracks: favoriteTracks,
        }
      : customPlaylists.find((pl) => pl.id === selectedPlaylistId) || spatialPlaylist;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      {/* Custom Frameless Apple Window Bar */}
      <TitleBar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Apple Style Glass Sidebar */}
        <Sidebar />

        {/* Main Content Area with AnimatePresence */}
        <main className="flex-1 h-[calc(100vh-44px-80px)] overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedPlaylistId || selectedAlbumId || selectedArtistId || "")}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {activeView === "lyrics" ? (
                <LyricsPage />
              ) : activeView === "album" ? (
                <AlbumPage albumId={selectedAlbumId} />
              ) : activeView === "artist" ? (
                <ArtistPage artistId={selectedArtistId} />
              ) : activeView === "profile" ? (
                <ProfilePage />
              ) : activeView === "settings" ? (
                <SettingsPage />
              ) : activeView === "search" ? (
                <SearchView />
              ) : activeView === "playlist-detail" || activeView === "favorites" ? (
                currentDetailPlaylist ? (
                  <PlaylistDetailView playlist={currentDetailPlaylist} />
                ) : (
                  <div className="text-center py-20 text-neutral-400">歌单不存在或已被移除</div>
                )
              ) : (
                <>
                  {/* Hero Banner Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 via-pink-600 to-[#fa2d48] p-8 text-white shadow-xl shadow-[#fa2d48]/15"
                  >
                    <div className="max-w-xl space-y-3 relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
                        <Sparkles className="w-3.5 h-3.5" /> 今日聚焦 · 杜比全景声
                      </span>
                      <h1 className="text-3xl font-extrabold tracking-tight">
                        {spatialPlaylist?.title || "Apple Spatial Audio 空间音频精选"}
                      </h1>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {spatialPlaylist?.description ||
                          "戴上 AirPods 或 Hi-Fi 耳机，感受 360 度全方位包裹的杜比全景声沉浸式音乐盛宴。"}
                      </p>
                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          onClick={handleHeroPlay}
                          size="pill"
                          className="bg-white text-black hover:bg-white/90 shadow-xl"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" /> 暂停播放
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current ml-0.5" /> 立即播放 ({spatialPlaylist?.tracks?.length || 0} 首)
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setActiveView("search")}
                          size="pill"
                          variant="glass"
                          className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
                        >
                          搜索探索
                        </Button>
                      </div>
                    </div>
                    {/* Ambient art ornament */}
                    <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  </motion.section>

                  {/* Online Dynamic Tracks List (TanStack Query) */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Disc3 className="w-5 h-5 text-[#fa2d48]" /> 精选曲目列表 (在线流播放)
                      </h2>
                      <span className="text-xs text-neutral-400 font-medium">
                        {isLoading ? "正在同步云端曲目..." : `共 ${spatialPlaylist?.tracks?.length || 0} 首曲目`}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-14 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        {spatialPlaylist?.tracks?.map((track, idx) => {
                          const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;

                          return (
                            <motion.div key={track.id} variants={staggerItem}>
                              <Card
                                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group cursor-pointer ${
                                  isCurrent
                                    ? "border-[#fa2d48]/40 bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                                    : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10"
                                }`}
                                onClick={() => playTrack(track, spatialPlaylist.tracks)}
                              >
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
                                      {track.artist} · {track.album || "精选单曲"}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isCurrent) {
                                      togglePlay();
                                    } else {
                                      playTrack(track, spatialPlaylist.tracks);
                                    }
                                  }}
                                  className={`w-8 h-8 rounded-full transition-all ${
                                    isCurrent
                                      ? "opacity-100 scale-100"
                                      : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                  }`}
                                >
                                  {isCurrent && isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                  )}
                                </Button>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </section>

                  {/* Quick Recommendations Grid */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#fa2d48]" /> 热门歌单推荐
                      </h2>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveView("search")}
                        className="text-xs font-semibold text-[#fa2d48] p-0 h-auto"
                      >
                        查看全部
                      </Button>
                    </div>

                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
                    >
                      {[
                        { title: "Today's Hits", desc: "全球热歌榜单", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" },
                        { title: "A-List Pop", desc: "华语与欧美流行金曲", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80" },
                        { title: "Pure Focus", desc: "深度心流工作学习", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80" },
                        { title: "Spatial Audio", desc: "杜比全景声环绕", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80" },
                        { title: "Late Night Jazz", desc: "微醺慵懒爵士夜", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
                      ].map((item, idx) => (
                        <motion.div key={idx} variants={staggerItem}>
                          <Card
                            onClick={() => setActiveView("album", "17910751956")}
                            className="group cursor-pointer space-y-2 p-2 border-0 bg-transparent shadow-none"
                          >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative shadow-md group-hover:shadow-xl transition-all duration-300">
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <Button
                                size="icon"
                                variant="apple"
                                className="absolute right-3 bottom-3 w-10 h-10 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                              >
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </Button>
                            </div>
                            <CardContent className="p-0">
                              <h3 className="text-sm font-semibold truncate group-hover:text-[#fa2d48] transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{item.desc}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Apple Music Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default App;
