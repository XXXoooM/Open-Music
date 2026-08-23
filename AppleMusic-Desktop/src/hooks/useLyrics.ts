import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { parseLrc } from "@/utils/lrcParser";
import { LyricsLine } from "@/types/lyrics";
import { Track } from "@/types/music";
import { useSettingsStore } from "@/stores/settingsStore";
import { buildMetingUrl } from "@/api/musicClient";

export function useLyrics(track: Track | null) {
  const { apiSource, musicServer } = useSettingsStore();

  return useQuery<LyricsLine[]>({
    queryKey: ["lyrics", track?.id, track?.url, apiSource, musicServer],
    queryFn: async () => {
      if (!track) return [];

      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;

      // 1. Try Rust backend command `get_lyrics`
      if (isTauri) {
        try {
          const lrcRaw = await invoke<string>("get_lyrics", {
            trackId: track.id,
            source: apiSource,
            server: musicServer,
          });
          if (lrcRaw && typeof lrcRaw === "string" && lrcRaw.trim()) {
            return parseLrc(lrcRaw);
          }
        } catch (e) {
          console.warn("[Tauri] get_lyrics fallback to network fetch:", e);
        }
      }

      // 2. Direct lrc url if track already has one
      if (track.lrc && track.lrc.startsWith("http")) {
        try {
          const res = await fetch(track.lrc, { signal: AbortSignal.timeout(6000) });
          if (res.ok) {
            const text = await res.text();
            return parseLrc(text);
          }
        } catch (err) {
          console.warn("Direct track.lrc fetch failed:", err);
        }
      }

      // 3. Request Meting lrc endpoint
      try {
        const lrcUrl = buildMetingUrl(apiSource, musicServer, "lrc", track.id);
        const res = await fetch(lrcUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const text = await res.text();
          return parseLrc(text);
        }
      } catch (err) {
        console.warn("Meting lrc API failed:", err);
      }

      // Default mock lyrics if offline or sample track
      return [
        { time: 0.0, text: `${track.name} - ${track.artist}` },
        { time: 3.5, text: "作词 / 作曲 · 经典精选" },
        { time: 8.0, text: "正在为您呈现 Apple Music 沉浸式动态歌词" },
        { time: 14.2, text: "轻触任意歌词行即可实现精准音频进度跳转" },
        { time: 22.0, text: "跟随旋律享受每一刻动人音符" },
        { time: 35.0, text: "♪ 音乐律动中 ♪" },
      ];
    },
    enabled: !!track,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
}
