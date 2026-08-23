import React, { useState } from "react";
import {
  X,
  Settings,
  Sparkles,
  Sliders,
  Keyboard,
  Trash2,
  CheckCircle2,
  Server,
  Radio,
  ListMusic
} from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore, ApiSource, MusicServer } from "@/stores/settingsStore";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { mode, setMode } = useThemeStore();
  const {
    apiSource,
    musicServer,
    defaultPlaylistId,
    audioQuality,
    setApiSource,
    setMusicServer,
    setDefaultPlaylistId,
    setAudioQuality,
  } = useSettingsStore();

  const queryClient = useQueryClient();
  const [customIdInput, setCustomIdInput] = useState<string>(defaultPlaylistId);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSavePlaylistId = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customIdInput.trim() || "17910751956";
    setDefaultPlaylistId(id);
    queryClient.invalidateQueries({ queryKey: ["playlist"] });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 1500);
  };

  const handleClearCache = () => {
    localStorage.removeItem("apple-custom-playlists");
    localStorage.removeItem("apple-favorite-tracks");
    setClearedNotice(true);
    setTimeout(() => {
      setClearedNotice(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl p-7 apple-glass border border-white/20 dark:border-white/10 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff758c] flex items-center justify-center text-white shadow-lg shadow-[#fa2d48]/25">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              设置与偏好 (Settings)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Apple Music 客户端 · 双源 Meting-API 引擎配置
            </p>
          </div>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>默认歌单 ID 已更新，并已触发云端刷新！</span>
          </div>
        )}

        {clearedNotice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>缓存已清除，正在重新加载...</span>
          </div>
        )}

        {/* Section 1: Meting API Route Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#fa2d48]" /> 音乐服务 API 线路切换
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                id: "qijieya" as ApiSource,
                name: "线路一 (祈杰のMeting)",
                desc: "支持网易云VIP解析 / 320k",
                url: "api.qijieya.cn/meting/",
              },
              {
                id: "mikus" as ApiSource,
                name: "线路二 (Meting-API)",
                desc: "mikus.ink 官方高可用镜像",
                url: "meting.mikus.ink/api",
              },
            ].map((route) => (
              <div
                key={route.id}
                onClick={() => {
                  setApiSource(route.id);
                  queryClient.invalidateQueries({ queryKey: ["playlist"] });
                }}
                className={`p-3 rounded-2xl apple-glass border transition-all cursor-pointer space-y-1 ${
                  apiSource === route.id
                    ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10 shadow-sm"
                    : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {route.name}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      apiSource === route.id ? "border-[#fa2d48] bg-[#fa2d48]" : "border-neutral-400"
                    }`}
                  >
                    {apiSource === route.id && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{route.desc}</p>
                <div className="text-[9px] font-mono text-[#fa2d48] truncate">{route.url}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Platform Selection & Default Playlist */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#fa2d48]" /> 默认音乐平台与歌单 ID
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "netease" as MusicServer, label: "网易云音乐 (Netease)", desc: "支持歌单与VIP单曲解析" },
              { id: "tencent" as MusicServer, label: "QQ音乐 (Tencent)", desc: "QQ音乐公开歌单与曲库" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setMusicServer(p.id);
                  queryClient.invalidateQueries({ queryKey: ["playlist"] });
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  musicServer === p.id
                    ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                    : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{p.label}</div>
                <div className="text-[10px] text-neutral-400">{p.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSavePlaylistId} className="space-y-1.5 pt-1">
            <label className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <ListMusic className="w-3 h-3 text-[#fa2d48]" /> 导入网易云/QQ 歌单 ID (默认：17910751956)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customIdInput}
                onChange={(e) => setCustomIdInput(e.target.value)}
                placeholder="输入歌单 ID (如: 17910751956 或 2619366284)"
                className="flex-1 h-9 px-3 rounded-xl apple-glass border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-[#fa2d48]"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-[#fa2d48] text-white text-xs font-semibold hover:bg-[#ff3b56] transition-colors cursor-pointer"
              >
                载入歌单
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Appearance */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fa2d48]" /> 外观与主题
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "跟随系统", value: "system" },
              { label: "浅色模式", value: "light" },
              { label: "深色模式", value: "dark" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setMode(t.value as any)}
                className={`py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  mode === t.value
                    ? "bg-[#fa2d48] text-white border-[#fa2d48] shadow-sm shadow-[#fa2d48]/25"
                    : "apple-glass hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 border-black/5 dark:border-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Audio Quality */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#fa2d48]" /> 空间音频与解码音质
          </label>
          <div className="space-y-2">
            {[
              { id: "spatial", label: "杜比全景声 (Dolby Atmos / Spatial Audio)", desc: "提供 360 度多维沉浸环绕" },
              { id: "lossless", label: "无损高保真 (ALAC Lossless 24-bit/48kHz)", desc: "保留原汁原味的录音室细节" },
              { id: "standard", label: "标准高效 (AAC 256kbps)", desc: "节省流量与带宽资源" },
            ].map((q) => (
              <div
                key={q.id}
                onClick={() => setAudioQuality(q.id as any)}
                className={`p-3 rounded-xl apple-glass border transition-all cursor-pointer flex items-center justify-between ${
                  audioQuality === q.id
                    ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                    : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{q.label}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{q.desc}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    audioQuality === q.id
                      ? "border-[#fa2d48] bg-[#fa2d48] text-white"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  {audioQuality === q.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Keyboard Shortcuts Cheatsheet */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-[#fa2d48]" /> 键盘快捷键一览
          </label>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl apple-glass border border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">播放 / 暂停</span>
              <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">Space</kbd>
            </div>
            <div className="p-2 rounded-xl apple-glass border border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">快进 / 快退 5s</span>
              <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">← / →</kbd>
            </div>
            <div className="p-2 rounded-xl apple-glass border border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">音量调大 / 调小</span>
              <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">↑ / ↓</kbd>
            </div>
            <div className="p-2 rounded-xl apple-glass border border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">一键静音</span>
              <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">M</kbd>
            </div>
          </div>
        </div>

        {/* Section 6: Clear Cache */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            双源服务实时智能容灾接入已激活
          </div>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> 清空本地数据
          </button>
        </div>
      </div>
    </div>
  );
};
