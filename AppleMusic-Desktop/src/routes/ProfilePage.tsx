import React, { useState } from "react";
import {
  Heart,
  Clock,
  LogOut,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useFavoritesQuery, useToggleFavoriteMutation, useHistoryQuery } from "@/hooks/useProfile";
import { useHistoryStore } from "@/stores/historyStore";
import { LoginModal } from "@/components/Auth/LoginModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedTabs } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "@/stores/toastStore";

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { playTrack, currentTrack } = usePlayerStore();
  const { clearHistory } = useHistoryStore();

  const [activeTab, setActiveTab] = useState<string>("favorites");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { data: favorites = [] } = useFavoritesQuery();
  const { data: history = [] } = useHistoryQuery(50);
  const toggleFavMutation = useToggleFavoriteMutation();

  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 select-none animate-in fade-in duration-300">
      {/* Bento Profile Header */}
      <div className="bento-card p-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <img
          src={user?.avatarUrl || defaultAvatar}
          alt={user?.nickname || "User"}
          className="w-20 h-20 rounded-full object-cover shadow-xl border-2 border-[#FA2D48]/40 flex-shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold apple-title text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                {isAuthenticated ? user?.nickname : "访客体验用户"}
                {isAuthenticated && <Badge variant="apple">Apple ID 认证</Badge>}
              </h1>
              <p className="apple-caption mt-0.5">
                {isAuthenticated ? "已激活 Apple Music 空间音频订阅服务" : "登录 Apple ID 跨设备同步收藏曲目与自建歌单"}
              </p>
            </div>

            <div>
              {isAuthenticated ? (
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500 hover:bg-red-500/10 rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" /> 退出登录
                </Button>
              ) : (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  size="default"
                  className="font-semibold text-xs h-8.5 px-5"
                >
                  登录 Apple ID
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#86868b]">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {favorites.length} 首喜爱曲目
            </span>
            <span>·</span>
            <span>{history.length} 条播放足迹</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between">
        <SegmentedTabs
          layoutId="profile-tabs-pill"
          value={activeTab}
          onValueChange={setActiveTab}
          items={[
            { value: "favorites", label: `喜爱歌曲 (${favorites.length})`, icon: <Heart className="w-3.5 h-3.5" /> },
            { value: "history", label: `最近播放 (${history.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
          ]}
        />

        {activeTab === "history" && history.length > 0 && (
          <Button
            onClick={() => {
              clearHistory();
              toast.info("已清空最近播放历史");
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-[#86868b] hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> 清空历史
          </Button>
        )}
      </div>

      {/* Content List */}
      {activeTab === "favorites" ? (
        favorites.length === 0 ? (
          <div className="py-24 text-center text-neutral-400 space-y-2">
            <Heart className="w-12 h-12 mx-auto opacity-20" />
            <div className="text-sm font-semibold">暂无喜爱歌曲</div>
            <div className="apple-caption">在探索或专辑页面点击红心图标即可收藏</div>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {favorites.map((track) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              return (
                <motion.div key={track.id} variants={staggerItem}>
                  <div
                    onClick={() => playTrack(track, favorites)}
                    className={`bento-card flex items-center justify-between p-3 transition-all group cursor-pointer ${
                      isCurrent
                        ? "ring-2 ring-[#FA2D48]/40 bg-[#FA2D48]/5 dark:bg-[#FA2D48]/10"
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <img src={track.pic} alt={track.name} className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className={`text-[13px] font-semibold truncate ${isCurrent ? "text-[#FA2D48]" : "group-hover:text-[#FA2D48]"}`}>
                          {track.name}
                        </div>
                        <div className="apple-caption truncate">{track.artist}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavMutation.mutate(track);
                        toast.info("已移出喜爱歌曲", track.name);
                      }}
                      className="p-1.5 text-[#FA2D48] hover:bg-[#FA2D48]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : (
        history.length === 0 ? (
          <div className="py-24 text-center text-neutral-400 space-y-2">
            <Clock className="w-12 h-12 mx-auto opacity-20" />
            <div className="text-sm font-semibold">暂无播放记录</div>
            <div className="apple-caption">播放任意歌曲后将在此自动记录</div>
          </div>
        ) : (
          <div className="inset-group divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {history.map((item, idx) => {
                const isCurrent = currentTrack?.id === item.track.id || currentTrack?.url === item.track.url;
                return (
                  <motion.div key={item.track.id + idx} variants={staggerItem}>
                    <div
                      onClick={() => playTrack(item.track, history.map((h) => h.track))}
                      className={`flex items-center justify-between px-4 py-3 transition-colors group cursor-pointer ${
                        isCurrent
                          ? "bg-[#FA2D48]/10 text-[#FA2D48]"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden pr-2">
                        <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                          {idx + 1}
                        </span>
                        <img src={item.track.pic} alt={item.track.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div className="overflow-hidden">
                          <div className={`text-[13px] font-semibold truncate ${isCurrent ? "text-[#FA2D48]" : "group-hover:text-[#FA2D48]"}`}>
                            {item.track.name}
                          </div>
                          <div className="apple-caption truncate">{item.track.artist}</div>
                        </div>
                      </div>
                      <span className="tabular-nums font-mono text-[11px] text-[#86868b] w-12 text-right">
                        {formatDuration(item.track.duration)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default ProfilePage;
