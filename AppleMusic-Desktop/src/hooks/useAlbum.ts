import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Album } from "@/types/album";
import { useSettingsStore } from "@/stores/settingsStore";
import { buildMetingUrl, parseRawMetingItem } from "@/api/musicClient";

export function useAlbum(albumId?: string | null) {
  const { apiSource, musicServer } = useSettingsStore();
  const targetId = albumId || "17910751956";

  return useQuery<Album>({
    queryKey: ["album", targetId, apiSource, musicServer],
    queryFn: async () => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;

      // 1. Try Rust get_album command
      if (isTauri) {
        try {
          const data = await invoke<Album>("get_album", {
            id: targetId,
            source: apiSource,
            server: musicServer,
          });
          if (data && data.tracks && data.tracks.length > 0) {
            return data;
          }
        } catch (e) {
          console.warn("[Tauri] get_album fallback to web fetch:", e);
        }
      }

      // 2. Fetch via Meting API (playlist or song batch)
      try {
        const url = buildMetingUrl(apiSource, musicServer, "playlist", targetId);
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const tracks = data.map((item: any) => parseRawMetingItem(item, apiSource));
            return {
              id: targetId,
              name: tracks[0]?.album || "七里香 (Common Jasmine Orange)",
              artist: tracks[0]?.artist || "周杰伦",
              cover: tracks[0]?.pic || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80",
              publishYear: "2004",
              trackCount: tracks.length,
              company: "JVR Music / 杰威尔音乐",
              description: "华语流行乐坛里程碑专辑，收录《七里香》、《借口》、《止战之殇》等多首经典传唱金曲。",
              tracks,
            };
          }
        }
      } catch (err) {
        console.warn("Meting album fetch error:", err);
      }

      // Fallback Mock Album
      return {
        id: targetId,
        name: "七里香 (Common Jasmine Orange)",
        artist: "周杰伦",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80",
        publishYear: 2004,
        trackCount: 2,
        company: "JVR Music / 杰威尔音乐",
        description: "周杰伦第5张个人录音室专辑，整张专辑弥漫着浓郁的东方诗意与夏日初恋气息。",
        tracks: [
          {
            id: "t-1",
            name: "七里香 (Common Jasmine Orange)",
            artist: "周杰伦",
            album: "七里香",
            pic: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80",
            url: "https://music.163.com/song/media/outer/url?id=186016.mp3",
            duration: 299,
          },
          {
            id: "t-2",
            name: "晴天 (Sunny Day)",
            artist: "周杰伦",
            album: "叶惠美",
            pic: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
            url: "https://music.163.com/song/media/outer/url?id=186015.mp3",
            duration: 269,
          },
        ],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}
