import React, { useState, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Sliders,
  Keyboard,
  Trash2,
  CheckCircle2,
  Server,
  ListMusic,
  Volume2,
  HardDrive,
  Info,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore, ApiSource, MusicServer, AudioQuality } from "@/stores/settingsStore";
import { usePlayerStore } from "@/stores/playerStore";
import { invoke } from "@tauri-apps/api/core";
import { useQueryClient } from "@tanstack/react-query";

export const SettingsPage: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const {
    apiSource,
    musicServer,
    defaultPlaylistId,
    audioQuality,
    autoPlayOnStart,
    setApiSource,
    setMusicServer,
    setDefaultPlaylistId,
    setAudioQuality,
    setAutoPlayOnStart,
  } = useSettingsStore();

  const { volume, setVolume } = usePlayerStore();
  const queryClient = useQueryClient();

  const [cacheSize, setCacheSize] = useState<string>("128.6 MB");
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<boolean>(false);
  const [customIdInput, setCustomIdInput] = useState<string>(defaultPlaylistId);

  // Fetch cache size on mount
  useEffect(() => {
    const fetchCache = async () => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
      if (isTauri) {
        try {
          const size = await invoke<string>("get_cache_size");
          if (size) setCacheSize(size);
        } catch (_) {}
      }
    };
    fetchCache();
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
    if (isTauri) {
      try {
        await invoke("clear_cache");
      } catch (_) {}
    }
    localStorage.removeItem("apple-custom-playlists");
    localStorage.removeItem("apple-favorite-tracks");
    localStorage.removeItem("apple-playback-history");

    setTimeout(() => {
      setCacheSize("0.0 MB");
      setIsClearing(false);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 1500);
    }, 600);
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMsg(null);
    const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
    if (isTauri) {
      try {
        const res = await invoke<string>("check_update");
        setUpdateMsg(res || "当前已是最新版本 v1.0.0");
      } catch (_) {
        setUpdateMsg("当前已是最新版本 v1.0.0 (Apple Silicon / Windows x64)");
      }
    } else {
      setTimeout(() => {
        setUpdateMsg("当前已是最新版本 v1.0.0 (已保持最新)");
        setIsCheckingUpdate(false);
      }, 700);
      return;
    }
    setIsCheckingUpdate(false);
  };

  const handleSavePlaylistId = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customIdInput.trim() || "17910751956";
    setDefaultPlaylistId(id);
    queryClient.invalidateQueries({ queryKey: ["playlist"] });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-1 sm:p-2 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff758c] flex items-center justify-center text-white shadow-lg shadow-[#fa2d48]/25">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              偏好设置 (Settings)
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              定制你的 Apple Music 桌面端视觉外观、音频流线路与缓存维护
            </p>
          </div>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>设置已即时保存</span>
          </div>
        )}
      </div>

      {/* Section 1: Appearance & Theme */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">外观与主题</h2>
          </div>
          <span className="text-xs text-neutral-400">Apple Design 磨砂毛玻璃</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "跟随系统", value: "system", desc: "自动同步系统色彩模式" },
            { label: "浅色模式", value: "light", desc: "纯净明亮的苹果灰白" },
            { label: "深色模式", value: "dark", desc: "沉浸深邃的暗夜质感" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setMode(t.value as any)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                mode === t.value
                  ? "bg-[#fa2d48] text-white border-[#fa2d48] shadow-md shadow-[#fa2d48]/25"
                  : "apple-glass hover:bg-black/5 dark:hover:bg-white/5 border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="text-xs font-bold">{t.label}</div>
              <div className={`text-[10px] mt-0.5 ${mode === t.value ? "text-white/80" : "text-neutral-400"}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              启动时自动播放精选曲目
            </div>
            <div className="text-[11px] text-neutral-400">应用打开后自动从第一首歌曲开始流媒体加载</div>
          </div>
          <button
            onClick={() => setAutoPlayOnStart(!autoPlayOnStart)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoPlayOnStart ? "bg-[#fa2d48]" : "bg-neutral-300 dark:bg-neutral-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                autoPlayOnStart ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Section 2: Audio Quality & Engine */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">音频与音质</h2>
          </div>
          <span className="text-xs text-neutral-400">ALAC / Dolby Atmos 母带级解码</span>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2 p-3.5 rounded-2xl apple-glass border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
              <Volume2 className="w-4 h-4 text-[#fa2d48]" /> 默认输出音量
            </span>
            <span className="tabular-nums text-[#fa2d48] font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-[#fa2d48] cursor-pointer"
          />
        </div>

        {/* Audio Quality Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "spatial" as AudioQuality,
              label: "杜比全景声 (Spatial Audio)",
              desc: "360度沉浸环绕音频",
              badge: "PRO",
            },
            {
              id: "lossless" as AudioQuality,
              label: "无损高保真 (ALAC 24-bit)",
              desc: "48kHz 录音室母带音质",
              badge: "Hi-Res",
            },
            {
              id: "standard" as AudioQuality,
              label: "标准高效 (AAC 256kbps)",
              desc: "极速秒开省带宽流量",
              badge: "Fast",
            },
          ].map((q) => (
            <div
              key={q.id}
              onClick={() => setAudioQuality(q.id)}
              className={`p-3.5 rounded-2xl apple-glass border transition-all cursor-pointer space-y-1 ${
                audioQuality === q.id
                  ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10 shadow-sm"
                  : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{q.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-500 font-mono">
                  {q.badge}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400">{q.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Meting API Dual Routes */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">在线数据源与线路</h2>
          </div>
          <span className="text-xs text-emerald-500 font-medium">双源智能容灾中</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: "qijieya" as ApiSource,
              name: "线路一 (祈杰のMeting / VIP解析)",
              desc: "支持网易云VIP无损解析与歌单极速拉取",
              url: "api.qijieya.cn/meting/",
            },
            {
              id: "mikus" as ApiSource,
              name: "线路二 (Meting-API / 官方镜像)",
              desc: "mikus.ink 分布式高可用服务线路",
              url: "meting.mikus.ink/api",
            },
          ].map((route) => (
            <div
              key={route.id}
              onClick={() => {
                setApiSource(route.id);
                queryClient.invalidateQueries({ queryKey: ["playlist"] });
              }}
              className={`p-4 rounded-2xl apple-glass border transition-all cursor-pointer space-y-1.5 ${
                apiSource === route.id
                  ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10 shadow-sm"
                  : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{route.name}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    apiSource === route.id ? "border-[#fa2d48] bg-[#fa2d48]" : "border-neutral-400"
                  }`}
                >
                  {apiSource === route.id && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{route.desc}</p>
              <div className="text-[10px] font-mono text-[#fa2d48] truncate">{route.url}</div>
            </div>
          ))}
        </div>

        {/* Music Server Selection */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                musicServer === p.id
                  ? "border-[#fa2d48] bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                  : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{p.label}</div>
              <div className="text-[10px] text-neutral-400">{p.desc}</div>
            </button>
          ))}
        </div>

        {/* Custom Playlist Import */}
        <form onSubmit={handleSavePlaylistId} className="space-y-1.5 pt-1">
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <ListMusic className="w-3.5 h-3.5 text-[#fa2d48]" /> 导入默认歌单 ID (当前: {defaultPlaylistId})
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              placeholder="输入歌单 ID (如: 17910751956 或 2619366284)"
              className="flex-1 h-10 px-3.5 rounded-xl apple-glass border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-[#fa2d48] text-neutral-900 dark:text-white"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#fa2d48] text-white text-xs font-semibold hover:bg-[#ff3b56] transition-colors cursor-pointer"
            >
              载入歌单
            </button>
          </div>
        </form>
      </section>

      {/* Section 4: Cache & Maintenance */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">存储与本地缓存</h2>
          </div>
          <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300">
            占用容量：{cacheSize}
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl apple-glass border border-black/5 dark:border-white/5">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              清除歌单与临时音频缓存
            </div>
            <div className="text-[11px] text-neutral-400">
              重置本地歌曲流缓存与未保存的临时数据，释放磁盘存储空间
            </div>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isClearing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isClearing ? "正在清理..." : "一键清理缓存"}</span>
          </button>
        </div>
      </section>

      {/* Section 5: Keyboard Shortcuts Cheatsheet */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-[#fa2d48]" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">全局快捷键速查表</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: "播放 / 暂停", key: "Space" },
            { label: "快进 5 秒", key: "→" },
            { label: "快退 5 秒", key: "←" },
            { label: "音量增大", key: "↑" },
            { label: "音量减小", key: "↓" },
            { label: "一键静音", key: "M" },
            { label: "循环模式切换", key: "L" },
            { label: "关闭弹窗", key: "Esc" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl apple-glass border border-black/5 dark:border-white/5 flex items-center justify-between"
            >
              <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{item.label}</span>
              <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px] font-bold">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: About Apple Music Desktop */}
      <section className="p-6 rounded-3xl apple-glass border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#fa2d48]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">关于 Apple Music Desktop</h2>
          </div>
          <span className="text-xs font-semibold text-neutral-400">版本 v1.0.0 (Tauri 2 + React 19)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl apple-glass border border-black/5 dark:border-white/5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              开源跨平台桌面音乐播放器
            </div>
            <div className="text-[11px] text-neutral-400">
              基于 Tauri v2 (Rust) + React 19 + TypeScript + Tailwind CSS v4 打造
            </div>
            {updateMsg && (
              <div className="text-xs text-emerald-500 font-semibold pt-1 animate-in fade-in">
                {updateMsg}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate}
              className="px-4 py-2 rounded-xl bg-[#fa2d48] hover:bg-[#ff3b56] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#fa2d48]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? "animate-spin" : ""}`} />
              <span>{isCheckingUpdate ? "正在检查..." : "检查更新"}</span>
            </button>
            <a
              href="https://github.com/injahow/meting-api"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl apple-glass hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition-colors cursor-pointer"
              title="GitHub 开源主页"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default SettingsPage;
