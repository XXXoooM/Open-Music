import { useEffect, lazy, Suspense } from "react";
import { TitleBar } from "@/components/TitleBar/TitleBar";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { PlayerBar } from "@/components/Player/PlayerBar";
import { SearchView } from "@/components/Search/SearchView";
import { PlaylistDetailView } from "@/components/Playlist/PlaylistDetailView";
import { ToastContainer } from "@/components/ui/toast";
import { AuroraBackground } from "@/components/Ambient/AuroraBackground";
import { usePlaylistQuery } from "@/hooks/useMusicQuery";
import { usePlayerStore } from "@/stores/playerStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Play, Pause, Sparkles, Flame, Disc3, Volume2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/motion";

const LyricsPage = lazy(() => import("@/routes/LyricsPage"));
const AlbumPage = lazy(() => import("@/routes/AlbumPage"));
const ArtistPage = lazy(() => import("@/routes/ArtistPage"));
const ProfilePage = lazy(() => import("@/routes/ProfilePage"));
const SettingsPage = lazy(() => import("@/routes/SettingsPage"));

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

  useMediaSession();
  useKeyboardShortcuts();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const handleHeroPlay = () => {
    if (!spatialPlaylist?.tracks || spatialPlaylist.tracks.length === 0) return;
    if (isPlaying) {
      togglePlay();
    } else {
      playTrack(spatialPlaylist.tracks[0], spatialPlaylist.tracks);
    }
  };

  const currentDetailPlaylist =
    activeView === "favorites"
      ? {
          id: "favorites",
          title: "喜爱歌曲",
          description: "你点亮红心收藏的所有珍藏单曲",
          cover:
            favoriteTracks[0]?.pic ||
            "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
          trackCount: favoriteTracks.length,
          tracks: favoriteTracks,
        }
      : customPlaylists.find((pl) => pl.id === selectedPlaylistId) || spatialPlaylist;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F5F5F7] dark:bg-[#0B0B0E] text-neutral-900 dark:text-neutral-50 transition-colors duration-300 relative">
      {/* 1. Global Ambient Aurora Backdrop */}
      <AuroraBackground />

      {/* 2. Apple Custom Window TitleBar */}
      <TitleBar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Apple Style Glass Sidebar */}
        <Sidebar />

        {/* Main Content Area centered with 1120px max-width */}
        <main className="flex-1 h-[calc(100vh-44px-72px)] overflow-y-auto px-8 py-7 max-w-[1120px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedPlaylistId || selectedAlbumId || selectedArtistId || "")}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8 pb-12"
            >
              <Suspense
                fallback={
                  <div className="h-96 flex flex-col items-center justify-center space-y-3 text-neutral-400">
                    <Loader2 className="w-7 h-7 animate-spin text-[#FA2D48]" />
                    <span className="text-xs font-semibold">正在载入 Apple Music 视效...</span>
                  </div>
                }
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
                    <div className="text-center py-24 text-neutral-400">歌单不存在或已被移除</div>
                  )
                ) : (
                  <>
                    {/* Bento Hero Card */}
                    <motion.section
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-pink-600 to-[#FA2D48] p-8 text-white shadow-xl shadow-[#FA2D48]/15"
                    >
                      <div className="max-w-xl space-y-3.5 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase">
                          <Sparkles className="w-3.5 h-3.5" /> 今日聚焦 · 杜比全景声
                        </span>
                        <h1 className="text-3xl font-extrabold apple-title leading-tight line-clamp-2">
                          {spatialPlaylist?.title || "Apple Spatial Audio 空间音频精选"}
                        </h1>
                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed line-clamp-2 max-w-lg">
                          {spatialPlaylist?.description ||
                            "戴上 AirPods 或 Hi-Fi 耳机，感受 360 度全方位包裹的杜比全景声沉浸式音乐盛宴。"}
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <Button
                            onClick={handleHeroPlay}
                            className="bg-white text-black hover:bg-white/95 shadow-md px-5 font-semibold text-xs h-8.5"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current mr-1" /> 暂停播放
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5 mr-1" /> 立即播放 ({spatialPlaylist?.tracks?.length || 0} 首)
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setActiveView("search")}
                            variant="secondary"
                            className="bg-black/20 hover:bg-black/30 text-white border border-white/20 px-4 font-semibold text-xs h-8.5"
                          >
                            搜索探索
                          </Button>
                        </div>
                      </div>
                      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none" />
                    </motion.section>

                    {/* Bento Grid: Online Tracks */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold apple-title flex items-center gap-2">
                          <Disc3 className="w-4 h-4 text-[#FA2D48]" /> 精选曲目推荐
                        </h2>
                        <span className="apple-caption font-mono">
                          {isLoading ? "正在同步云端..." : `共 ${spatialPlaylist?.tracks?.length || 0} 首曲目`}
                        </span>
                      </div>

                      {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 lg:grid-cols-2 gap-3.5"
                        >
                          {spatialPlaylist?.tracks?.map((track, idx) => {
                            const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;

                            return (
                              <motion.div key={track.id} variants={staggerItem}>
                                <div
                                  className={`bento-card flex items-center justify-between p-3 transition-all group cursor-pointer ${
                                    isCurrent ? "ring-2 ring-[#FA2D48]/40 bg-[#FA2D48]/5 dark:bg-[#FA2D48]/10" : "hover:scale-[1.01]"
                                  }`}
                                  onClick={() => playTrack(track, spatialPlaylist.tracks)}
                                >
                                  <div className="flex items-center gap-3 overflow-hidden pr-2">
                                    <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
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
                                    <div className="overflow-hidden">
                                      <div
                                        className={`text-sm font-semibold truncate transition-colors ${
                                          isCurrent ? "text-[#FA2D48]" : "group-hover:text-[#FA2D48]"
                                        }`}
                                      >
                                        {track.name}
                                      </div>
                                      <div className="apple-caption truncate">
                                        {track.artist} · {track.album || "精选单曲"}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant={isCurrent ? "default" : "secondary"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCurrent) {
                                        togglePlay();
                                      } else {
                                        playTrack(track, spatialPlaylist.tracks);
                                      }
                                    }}
                                    className={`w-8 h-8 rounded-full ${isCurrent ? "shadow-md shadow-[#FA2D48]/30" : ""}`}
                                  >
                                    {isCurrent && isPlaying ? (
                                      <Pause className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    )}
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </section>

                    {/* Bento Grid: 1:1 Curated Album Grid */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold apple-title flex items-center gap-2">
                          <Flame className="w-4 h-4 text-[#FA2D48]" /> 热门官方歌单
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveView("search")}
                          className="apple-caption hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                        >
                          <span>查看全部</span>
                          <ArrowRight className="w-3 h-3" />
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
                          { title: "A-List Pop", desc: "流行金曲精选", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80" },
                          { title: "Pure Focus", desc: "心流工作学习", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80" },
                          { title: "Spatial Audio", desc: "杜比全景声环绕", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80" },
                          { title: "Late Night Jazz", desc: "微醺慵懒爵士夜", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
                        ].map((item, idx) => (
                          <motion.div key={idx} variants={staggerItem}>
                            <div
                              onClick={() => setActiveView("album", "17910751956")}
                              className="bento-card p-2.5 space-y-2.5 group cursor-pointer hover:shadow-lg transition-all"
                            >
                              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative shadow-sm">
                                <img
                                  src={item.cover}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <Button
                                  size="icon"
                                  variant="default"
                                  className="absolute right-2.5 bottom-2.5 w-8.5 h-8.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </Button>
                              </div>
                              <div className="px-1">
                                <h3 className="text-xs font-semibold truncate group-hover:text-[#FA2D48] transition-colors">
                                  {item.title}
                                </h3>
                                <p className="apple-caption truncate mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </section>
                  </>
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Apple Music Player Bar */}
      <PlayerBar />

      {/* Apple Glass Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
