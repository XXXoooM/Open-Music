import React, { useState } from "react";
import {
  Heart,
  Clock,
  LogOut,
  Trash2,
  UserCheck,
  ShieldCheck,
  Calendar,
  Volume2
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useFavoritesQuery, useToggleFavoriteMutation, useHistoryQuery } from "@/hooks/useProfile";
import { useHistoryStore } from "@/stores/historyStore";
import { LoginModal } from "@/components/Auth/LoginModal";

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTimeAgo = (isoString: string) => {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "刚刚播放";
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  } catch (_) {
    return "最近播放";
  }
};

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { clearHistory } = useHistoryStore();

  const [activeTab, setActiveTab] = useState<"favorites" | "history">("favorites");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { data: favorites = [], isLoading: isFavLoading } = useFavoritesQuery();
  const { data: history = [], isLoading: isHistLoading } = useHistoryQuery(50);
  const toggleFavMutation = useToggleFavoriteMutation();

  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-8 p-1 sm:p-2 animate-in fade-in duration-300">
      {/* Profile Header Hero Card */}
      <section className="p-6 sm:p-8 rounded-3xl apple-glass border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <img
            src={user?.avatarUrl || defaultAvatar}
            alt={user?.nickname || "User"}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-2xl border-2 border-[#fa2d48]/40"
          />
          {isAuthenticated && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-md">
              <UserCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {isAuthenticated && user ? user.nickname : "访客体验用户"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fa2d48]/10 text-[#fa2d48] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAuthenticated ? "Apple Music 订阅尊享" : "未登录状态"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {isAuthenticated && user ? user.email : "登录 Apple ID 可同步云端歌单与跨设备听歌记录"}
          </p>

          <div className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-4 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {isAuthenticated && user?.joinedAt
                ? `加入于 ${new Date(user.joinedAt).toLocaleDateString()}`
                : "体验版客户端"}
            </span>
            <span>•</span>
            <span>已收藏 {favorites.length} 首歌曲</span>
            <span>•</span>
            <span>最近收听 {history.length} 首</span>
          </div>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> 退出登录
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 rounded-full bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#fa2d48]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" /> 登录 Apple ID
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Switcher: Favorites vs History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-[#fa2d48] text-white shadow-sm shadow-[#fa2d48]/25"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Heart className="w-4 h-4" /> 我的收藏 ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#fa2d48] text-white shadow-sm shadow-[#fa2d48]/25"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Clock className="w-4 h-4" /> 播放历史 ({history.length})
            </button>
          </div>

          {activeTab === "history" && history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-neutral-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空历史
            </button>
          )}
        </div>

        {/* Tab 1: Favorites List */}
        {activeTab === "favorites" && (
          <div className="space-y-2">
            {isFavLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 space-y-2">
                <Heart className="w-10 h-10 mx-auto opacity-30" />
                <div className="text-sm font-medium">你还没有收藏任何歌曲</div>
                <div className="text-xs">在探索或歌单页面点击红心即可将喜爱的歌曲珍藏在此</div>
              </div>
            ) : (
              <div className="rounded-2xl apple-glass border border-black/5 dark:border-white/5 overflow-hidden">
                {favorites.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;

                  return (
                    <div
                      key={track.id + idx}
                      onClick={() => playTrack(track, favorites)}
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
                            {track.artist} · {track.album || "单曲"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFavMutation.mutate(track)}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#fa2d48] transition-colors cursor-pointer"
                          title="取消收藏"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <span className="text-xs tabular-nums text-neutral-400 w-12 text-right">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History List */}
        {activeTab === "history" && (
          <div className="space-y-2">
            {isHistLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 space-y-2">
                <Clock className="w-10 h-10 mx-auto opacity-30" />
                <div className="text-sm font-medium">还没有播放记录</div>
                <div className="text-xs">播放任意歌曲后将自动为你记录在这里</div>
              </div>
            ) : (
              <div className="rounded-2xl apple-glass border border-black/5 dark:border-white/5 overflow-hidden">
                {history.map((item, idx) => {
                  const isCurrent = currentTrack?.id === item.track.id || currentTrack?.url === item.track.url;

                  return (
                    <div
                      key={item.track.id + idx}
                      onClick={() => playTrack(item.track, history.map((h) => h.track))}
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
                          src={item.track.pic}
                          alt={item.track.name}
                          className="w-10 h-10 rounded-lg object-cover shadow-sm flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className={`text-sm truncate ${isCurrent ? "text-[#fa2d48] font-bold" : "group-hover:text-[#fa2d48]"}`}>
                            {item.track.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {item.track.artist}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span>{formatTimeAgo(item.playedAt)}</span>
                        <span className="tabular-nums w-12 text-right">
                          {formatDuration(item.track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
export default ProfilePage;
