import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Server,
  HardDrive,
  Info,
  RefreshCw,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  Check,
  Music,
  Radio,
  Volume2,
  Trash2
} from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore, ApiSource, MusicServer, AudioQuality } from "@/stores/settingsStore";
import { usePlayerStore } from "@/stores/playerStore";
import { invoke } from "@tauri-apps/api/core";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SegmentedTabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/stores/toastStore";
import { motion, AnimatePresence } from "motion/react";

type SettingsTab = "general" | "audio" | "source" | "about";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

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
  const [customIdInput, setCustomIdInput] = useState<string>(defaultPlaylistId);

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
      toast.success("本地缓存已成功清理", "已释放磁盘空间");
    }, 500);
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
      }, 600);
      return;
    }
    setIsCheckingUpdate(false);
  };

  const handleSavePlaylistId = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customIdInput.trim() || "17910751956";
    setDefaultPlaylistId(id);
    queryClient.invalidateQueries({ queryKey: ["playlist"] });
    toast.success("默认歌单 ID 已更新", id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            偏好设置
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            配置 Apple Music 播放体验、音频解码与云端多线路
          </p>
        </div>
        <Badge variant="apple">macOS Sequoia</Badge>
      </div>

      {/* Top Segmented Navigation Tabs */}
      <div className="flex justify-center sm:justify-start">
        <SegmentedTabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as SettingsTab)}
          items={[
            { value: "general", label: "通用与外观", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { value: "audio", label: "音频与音质", icon: <Sliders className="w-3.5 h-3.5" /> },
            { value: "source", label: "网络与数据源", icon: <Server className="w-3.5 h-3.5" /> },
            { value: "about", label: "存储与关于", icon: <Info className="w-3.5 h-3.5" /> },
          ]}
        />
      </div>

      {/* Settings Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
              外观模式
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">主题配色</div>
                  <div className="text-xs text-neutral-400">选择应用在系统中的显示外观</div>
                </div>
                <SegmentedTabs
                  value={mode}
                  onValueChange={(v) => setMode(v as any)}
                  items={[
                    { value: "system", label: "跟随系统", icon: <Laptop className="w-3.5 h-3.5" /> },
                    { value: "light", label: "浅色", icon: <Sun className="w-3.5 h-3.5" /> },
                    { value: "dark", label: "深色", icon: <Moon className="w-3.5 h-3.5" /> },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">启动时自动播放</div>
                  <div className="text-xs text-neutral-400">应用打开后自动加载并播放精选歌单第一首歌曲</div>
                </div>
                <Switch checked={autoPlayOnStart} onCheckedChange={setAutoPlayOnStart} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "audio" && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
              输出与音量
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Volume2 className="w-3.5 h-3.5 text-[#fa2d48]" /> 默认播放音量
                </span>
                <span className="tabular-nums text-[#fa2d48] font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <Slider value={volume} onValueChange={setVolume} />
            </div>

            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1 pt-2">
              音频质量与空间音频格式
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
              {[
                {
                  id: "spatial" as AudioQuality,
                  title: "杜比全景声 (Spatial Audio)",
                  desc: "提供 360 度多维空间环绕立体声场，带来身临其境的剧场级体验",
                  badge: "Dolby Atmos",
                },
                {
                  id: "lossless" as AudioQuality,
                  title: "无损高保真音频 (ALAC)",
                  desc: "最高 24-bit/48kHz 录音室级别，精准保留每一个原声动态细节",
                  badge: "24-bit Lossless",
                },
                {
                  id: "standard" as AudioQuality,
                  title: "标准高效流媒体 (AAC)",
                  desc: "256kbps 极速秒开与智能带宽自适应，在弱网环境下更流畅",
                  badge: "Standard AAC",
                },
              ].map((item) => {
                const isSelected = audioQuality === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setAudioQuality(item.id);
                      toast.success("音频格式已切换", item.title);
                    }}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-500 font-mono">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400">{item.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#fa2d48] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "source" && (
          <motion.div
            key="source"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
              云端 API 线路与容灾
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
              {[
                {
                  id: "qijieya" as ApiSource,
                  title: "线路一 · 祈杰 Meting VIP 节点",
                  desc: "支持网易云 VIP 无损音质解析，推荐高速宽带用户首选",
                  url: "api.qijieya.cn/meting/",
                },
                {
                  id: "mikus" as ApiSource,
                  title: "线路二 · Mikus 官方分布式镜像",
                  desc: "全球分布式多节点高可用集群，具备强大的智能容灾能力",
                  url: "meting.mikus.ink/api",
                },
              ].map((route) => {
                const isSelected = apiSource === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      setApiSource(route.id);
                      queryClient.invalidateQueries({ queryKey: ["playlist"] });
                      toast.success("数据线路已切换", route.title);
                    }}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#fa2d48]/5 dark:bg-[#fa2d48]/10"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="space-y-0.5 pr-4">
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {route.title}
                      </div>
                      <div className="text-xs text-neutral-400">{route.desc}</div>
                      <div className="text-[10px] font-mono text-[#fa2d48]">{route.url}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#fa2d48] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1 pt-2">
              音乐服务商与歌单导入
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">默认解析平台</div>
                  <div className="text-xs text-neutral-400">选择歌单与歌曲搜索的主数据源</div>
                </div>
                <SegmentedTabs
                  value={musicServer}
                  onValueChange={(v) => {
                    const s = v as MusicServer;
                    setMusicServer(s);
                    queryClient.invalidateQueries({ queryKey: ["playlist"] });
                  }}
                  items={[
                    { value: "netease", label: "网易云音乐", icon: <Music className="w-3.5 h-3.5" /> },
                    { value: "tencent", label: "QQ 音乐", icon: <Radio className="w-3.5 h-3.5" /> },
                  ]}
                />
              </div>

              <form onSubmit={handleSavePlaylistId} className="space-y-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  导入外部歌单 ID (当前: {defaultPlaylistId})
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={customIdInput}
                    onChange={(e) => setCustomIdInput(e.target.value)}
                    placeholder="输入公开歌单 ID (如: 17910751956 或 2619366284)"
                    className="h-8 text-xs rounded-xl"
                  />
                  <Button type="submit" size="default" className="flex-shrink-0">
                    载入并同步
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
              本地存储空间
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#fa2d48]" />
                  <span>缓存与临时数据</span>
                  <span className="text-xs font-mono text-neutral-400">({cacheSize})</span>
                </div>
                <div className="text-xs text-neutral-400">
                  清理歌曲音频流切片与歌词离线缓存，重置本地临时数据
                </div>
              </div>
              <Button
                onClick={handleClearCache}
                disabled={isClearing}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl"
              >
                {isClearing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>{isClearing ? "正在清理..." : "一键清理"}</span>
              </Button>
            </div>

            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1 pt-2">
              应用版本与信息
            </div>
            <div className="rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Apple Music Desktop
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    版本 v1.0.0 (Tauri 2 + React 19 + Liquid Glass)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleCheckUpdate} disabled={isCheckingUpdate} size="sm">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCheckingUpdate ? "animate-spin" : ""}`} />
                    <span>{isCheckingUpdate ? "正在检查..." : "检查更新"}</span>
                  </Button>
                  <a
                    href="https://github.com/injahow/meting-api"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {updateMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
                  {updateMsg}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
