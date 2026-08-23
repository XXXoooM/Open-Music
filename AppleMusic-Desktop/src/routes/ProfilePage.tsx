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
import { Card } from "@/components/ui/card";
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none animate-in fade-in duration-300">
      {/* Profile Header Hero Card */}
      <Card className="p-6 rounded-3xl glass flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img
          src={user?.avatarUrl || defaultAvatar}
          alt={user?.nickname || "User"}
          className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-[#fa2d48]/40 flex-shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                {isAuthenticated ? user?.nickname : "访客体验用户"}
                {isAuthenticated && <Badge variant="apple">Apple ID 认证</Badge>}
              </h1>
              <p className="text-xs text-neutral-400">
                {isAuthenticated ? "已激活 Apple Music 空间音频订阅" : "登录后可跨设备同步喜爱歌曲与专属歌单"}
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
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> 退出登录
                </Button>
              ) : (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  size="sm"
                  className="rounded-xl font-semibold text-xs"
                >
                  登录 Apple ID
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {favorites.length} 首喜爱曲目
            </span>
            <span>·</span>
            <span>{history.length} 条播放足迹</span>
          </div>
        </div>
      </Card>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between">
        <SegmentedTabs
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
            className="text-xs text-neutral-400 hover:text-red-500 rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> 清空历史
          </Button>
        )}
      </div>

      {/* Content List */}
      {activeTab === "favorites" ? (
        favorites.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 space-y-2">
            <Heart className="w-10 h-10 mx-auto opacity-20" />
            <div className="text-sm font-semibold">暂无喜爱歌曲</div>
            <div className="text-xs">在搜索或发现页面点击红心图标即可收藏</div>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {favorites.map((track) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.url === track.url;
              return (
                <motion.div key={track.id} variants={staggerItem}>
                  <Card
                    onClick={() => playTrack(track, favorites)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group cursor-pointer ${
                      isCurrent
                        ? "border-[#fa2d48]/40 bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                        : "border-black/[0.04] dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] hover:bg-white/90 dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <img src={track.pic} alt={track.name} className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className={`text-xs font-semibold truncate ${isCurrent ? "text-[#fa2d48]" : "group-hover:text-[#fa2d48]"}`}>
                          {track.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">{track.artist}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavMutation.mutate(track);
                        toast.info("已移出喜爱歌曲", track.name);
                      }}
                      className="p-1.5 text-[#fa2d48] hover:bg-[#fa2d48]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : (
        history.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto opacity-20" />
            <div className="text-sm font-semibold">暂无播放记录</div>
            <div className="text-xs">播放任意歌曲后将在此自动记录</div>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-1">
            {history.map((item, idx) => {
              const isCurrent = currentTrack?.id === item.track.id || currentTrack?.url === item.track.url;
              return (
                <motion.div key={item.track.id + idx} variants={staggerItem}>
                  <div
                    onClick={() => playTrack(item.track, history.map((h) => h.track))}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${
                      isCurrent
                        ? "bg-[#fa2d48]/10 text-[#fa2d48]"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <span className="text-xs font-semibold text-neutral-400 w-5 text-center tabular-nums">
                        {idx + 1}
                      </span>
                      <img src={item.track.pic} alt={item.track.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className={`text-xs font-semibold truncate ${isCurrent ? "text-[#fa2d48]" : "group-hover:text-[#fa2d48]"}`}>
                          {item.track.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">{item.track.artist}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formatDuration(item.track.duration)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default ProfilePage;
