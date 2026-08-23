import React, { useState } from "react";
import {
  Compass,
  Radio,
  Music2,
  Clock,
  Heart,
  ListMusic,
  FolderHeart,
  Plus,
  LogIn,
  LogOut,
  UserCheck,
  Search,
  Mic2,
  User
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { LoginModal } from "@/components/Auth/LoginModal";
import { CreatePlaylistModal } from "@/components/Playlist/CreatePlaylistModal";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, count, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
      active
        ? "bg-[#fa2d48] text-white shadow-sm shadow-[#fa2d48]/25"
        : "text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
    }`}
  >
    <div className="flex items-center gap-2.5">
      <span className={active ? "text-white" : "text-neutral-500 dark:text-neutral-400"}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "text-neutral-400"}`}>
        {count}
      </span>
    )}
  </button>
);

export const Sidebar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { activeView, selectedPlaylistId, customPlaylists, favoriteTracks, setActiveView } = usePlaylistStore();

  return (
    <>
      <aside className="w-56 h-[calc(100vh-44px-80px)] apple-sidebar-glass flex flex-col justify-between select-none p-3">
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Quick Search Item */}
          <div className="space-y-0.5">
            <NavItem
              icon={<Search className="w-4 h-4" />}
              label="搜索探索"
              active={activeView === "search"}
              onClick={() => setActiveView("search")}
            />
            <NavItem
              icon={<Mic2 className="w-4 h-4" />}
              label="歌词舞台"
              active={activeView === "lyrics"}
              onClick={() => setActiveView("lyrics")}
            />
          </div>

          {/* Apple Music Navigation */}
          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              发现
            </div>
            <div className="space-y-0.5">
              <NavItem
                icon={<Compass className="w-4 h-4" />}
                label="现在就听"
                active={activeView === "listen-now"}
                onClick={() => setActiveView("listen-now")}
              />
              <NavItem
                icon={<Radio className="w-4 h-4" />}
                label="广播电台"
                active={activeView === "radio"}
                onClick={() => setActiveView("radio")}
              />
              <NavItem
                icon={<Music2 className="w-4 h-4" />}
                label="浏览排行榜"
                active={activeView === "charts"}
                onClick={() => setActiveView("charts")}
              />
            </div>
          </div>

          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              资料库
            </div>
            <div className="space-y-0.5">
              <NavItem
                icon={<User className="w-4 h-4" />}
                label="个人中心"
                active={activeView === "profile"}
                onClick={() => setActiveView("profile")}
              />
              <NavItem
                icon={<Heart className="w-4 h-4" />}
                label="喜爱歌曲"
                count={favoriteTracks.length}
                active={activeView === "favorites"}
                onClick={() => setActiveView("favorites")}
              />
              <NavItem icon={<Clock className="w-4 h-4" />} label="最近播放" onClick={() => setActiveView("profile")} />
              <NavItem icon={<FolderHeart className="w-4 h-4" />} label="已存专辑" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                我的歌单
              </span>
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="创建新歌单"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {customPlaylists.map((pl) => (
                <NavItem
                  key={pl.id}
                  icon={<ListMusic className="w-4 h-4" />}
                  label={pl.title}
                  count={pl.trackCount || pl.tracks?.length || 0}
                  active={activeView === "playlist-detail" && selectedPlaylistId === pl.id}
                  onClick={() => setActiveView("playlist-detail", pl.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* User / Authentication Area */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          {isAuthenticated && user ? (
            <div
              onClick={() => setActiveView("profile")}
              className="flex items-center justify-between px-2 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 overflow-hidden pr-1">
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-7 h-7 rounded-full object-cover border border-black/10 dark:border-white/15"
                />
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1">
                    {user.nickname}
                    <UserCheck className="w-3 h-3 text-[#fa2d48] flex-shrink-0" />
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">Apple Music Plus</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                title="退出登录"
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#fa2d48] hover:text-white dark:hover:bg-[#fa2d48] text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-all shadow-sm cursor-pointer group"
            >
              <LogIn className="w-3.5 h-3.5 text-[#fa2d48] group-hover:text-white transition-colors" />
              <span>登录 Apple ID</span>
            </button>
          )}
        </div>
      </aside>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreatePlaylistModal isOpen={isCreatePlaylistOpen} onClose={() => setIsCreatePlaylistOpen(false)} />
    </>
  );
};
