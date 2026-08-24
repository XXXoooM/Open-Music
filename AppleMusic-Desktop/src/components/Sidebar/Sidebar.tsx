import React, { useState } from "react";
import {
  Compass,
  Radio,
  Music2,
  Clock,
  Heart,
  ListMusic,
  Plus,
  LogIn,
  LogOut,
  UserCheck,
  Search,
  Mic2,
  User,
  Settings
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
    className={`w-full h-8 flex items-center justify-between px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none group ${
      active
        ? "bg-[#fa2d48]/12 text-[#fa2d48] dark:bg-[#fa2d48]/20 font-semibold"
        : "text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-neutral-900 dark:hover:text-white"
    }`}
  >
    <div className="flex items-center gap-2.5 overflow-hidden pr-1">
      <span className={`flex-shrink-0 transition-colors ${active ? "text-[#fa2d48]" : "text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200"}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] tabular-nums font-mono flex-shrink-0 px-1.5 py-0.5 rounded-md ${
        active ? "text-[#fa2d48] bg-[#fa2d48]/10" : "text-neutral-400"
      }`}>
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
      <aside className="w-56 h-[calc(100vh-44px-72px)] apple-sidebar-glass flex flex-col justify-between select-none p-3 flex-shrink-0 border-r border-black/[0.06] dark:border-white/[0.08]">
        <div className="space-y-4 overflow-y-auto pr-1 custom-sidebar-scroll">
          {/* Quick Access */}
          <div className="space-y-0.5">
            <NavItem
              icon={<Search className="w-3.5 h-3.5" />}
              label="搜索探索"
              active={activeView === "search"}
              onClick={() => setActiveView("search")}
            />
            <NavItem
              icon={<Mic2 className="w-3.5 h-3.5" />}
              label="歌词舞台"
              active={activeView === "lyrics"}
              onClick={() => setActiveView("lyrics")}
            />
            <NavItem
              icon={<Settings className="w-3.5 h-3.5" />}
              label="偏好设置"
              active={activeView === "settings"}
              onClick={() => setActiveView("settings")}
            />
          </div>

          {/* Section: Discover */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Apple Music
            </div>
            <div className="space-y-0.5">
              <NavItem
                icon={<Compass className="w-3.5 h-3.5" />}
                label="现在就听"
                active={activeView === "listen-now"}
                onClick={() => setActiveView("listen-now")}
              />
              <NavItem
                icon={<Radio className="w-3.5 h-3.5" />}
                label="广播电台"
                active={activeView === "radio"}
                onClick={() => setActiveView("radio")}
              />
              <NavItem
                icon={<Music2 className="w-3.5 h-3.5" />}
                label="排行榜"
                active={activeView === "charts"}
                onClick={() => setActiveView("charts")}
              />
            </div>
          </div>

          {/* Section: Library */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              资料库
            </div>
            <div className="space-y-0.5">
              <NavItem
                icon={<Heart className="w-3.5 h-3.5" />}
                label="喜爱歌曲"
                count={favoriteTracks.length}
                active={activeView === "favorites"}
                onClick={() => setActiveView("favorites")}
              />
              <NavItem
                icon={<Clock className="w-3.5 h-3.5" />}
                label="最近播放"
                active={activeView === "profile"}
                onClick={() => setActiveView("profile")}
              />
              <NavItem
                icon={<User className="w-3.5 h-3.5" />}
                label="个人中心"
                active={activeView === "profile"}
                onClick={() => setActiveView("profile")}
              />
            </div>
          </div>

          {/* Section: Playlists */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                自建歌单
              </span>
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                title="新建歌单"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              {customPlaylists.map((pl) => (
                <NavItem
                  key={pl.id}
                  icon={<ListMusic className="w-3.5 h-3.5" />}
                  label={pl.title}
                  count={pl.trackCount || pl.tracks?.length || 0}
                  active={activeView === "playlist-detail" && selectedPlaylistId === pl.id}
                  onClick={() => setActiveView("playlist-detail", pl.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
          {isAuthenticated && user ? (
            <div
              onClick={() => setActiveView("profile")}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
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
                  <div className="text-[10px] text-neutral-400 truncate">Apple Music 会员</div>
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
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#fa2d48] hover:text-white dark:hover:bg-[#fa2d48] text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer group"
            >
              <LogIn className="w-3.5 h-3.5 text-[#fa2d48] group-hover:text-white transition-colors" />
              <span>登录 Apple ID</span>
            </button>
          )}
        </div>
      </aside>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreatePlaylistModal isOpen={isCreatePlaylistOpen} onClose={() => setIsCreatePlaylistOpen(false)} />
    </>
  );
};
