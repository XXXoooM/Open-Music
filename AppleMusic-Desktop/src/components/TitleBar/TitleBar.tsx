import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Sun, Moon, Minus, Square, X, Settings } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { SettingsModal } from "@/components/Settings/SettingsModal";

export const TitleBar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const appWindow = typeof window !== "undefined" && (window as any).__TAURI__ ? getCurrentWindow() : null;

  const handleMinimize = async () => {
    if (appWindow) await appWindow.minimize();
  };

  const handleMaximize = async () => {
    if (appWindow) await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    if (appWindow) await appWindow.close();
  };

  return (
    <>
      <header
        data-tauri-drag-region
        className="h-11 w-full select-none flex items-center justify-between px-3 border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl bg-white/40 dark:bg-black/40 z-50 sticky top-0"
      >
        {/* macOS style traffic light window controls */}
        <div className="flex items-center gap-2" data-tauri-drag-region>
          <div className="flex items-center gap-2 group mr-2">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 active:brightness-75 border border-[#e0443e] flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="关闭"
            >
              <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
            </button>
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-90 active:brightness-75 border border-[#dea123] flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="最小化"
            >
              <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-90 active:brightness-75 border border-[#1aab29] flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="缩放 / 全屏"
            >
              <Square className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
            </button>
          </div>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 tracking-tight ml-2">
            Apple Music
          </span>
        </div>

        {/* Center Drag Region */}
        <div className="flex-1 h-full flex items-center justify-center" data-tauri-drag-region />

        {/* Right Controls (Settings & Theme Toggle) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
            title="偏好设置"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
            title={resolvedTheme === 'dark' ? '切换浅色模式' : '切换深色模式'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
