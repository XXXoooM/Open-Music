import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Artist } from "@/types/artist";
import { useSettingsStore } from "@/stores/settingsStore";
import { searchOnlineTracks } from "@/api/musicClient";

export function useArtist(artistId?: string | null) {
  const { apiSource, musicServer } = useSettingsStore();
  const targetId = artistId || "jay-chou";

  return useQuery<Artist>({
    queryKey: ["artist", targetId, apiSource, musicServer],
    queryFn: async () => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;

      // 1. Try Rust get_artist command
      if (isTauri) {
        try {
          const data = await invoke<Artist>("get_artist", {
            id: targetId,
            source: apiSource,
            server: musicServer,
          });
          if (data && data.topTracks && data.topTracks.length > 0) {
            return data;
          }
        } catch (e) {
          console.warn("[Tauri] get_artist fallback to web search:", e);
        }
      }

      // 2. Online search for top tracks & albums
      try {
        const tracks = await searchOnlineTracks("周杰伦", apiSource, musicServer, 10);
        if (tracks && tracks.length > 0) {
          return {
            id: targetId,
            name: "周杰伦 (Jay Chou)",
            avatar: tracks[0]?.pic || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
            monthlyListeners: "3,820,000+",
            verified: true,
            bio: "亚洲华语流行音乐领军人物，将东方古典意境与现代 R&B、嘻哈风格完美融合的音乐传奇。",
            genres: ["Mandopop", "R&B", "中国风", "Pop Rock"],
            topTracks: tracks.slice(0, 5),
            albums: [
              {
                id: "17910751956",
                name: "七里香",
                artist: "周杰伦",
                cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80",
                publishYear: "2004",
                trackCount: 10,
                tracks: tracks.slice(0, 2),
              },
              {
                id: "17910751956",
                name: "叶惠美",
                artist: "周杰伦",
                cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
                publishYear: "2003",
                trackCount: 11,
                tracks: tracks.slice(1, 3),
              },
              {
                id: "17910751956",
                name: "范特西 (Fantasy)",
                artist: "周杰伦",
                cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
                publishYear: "2001",
                trackCount: 10,
                tracks: tracks.slice(0, 3),
              },
            ],
          };
        }
      } catch (err) {
        console.warn("Artist search error:", err);
      }

      // Mock Default Artist
      return {
        id: targetId,
        name: "周杰伦 (Jay Chou)",
        avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
        monthlyListeners: "3,820,000+",
        verified: true,
        bio: "亚洲华语流行音乐领军人物，开创了独特的中国风与现代流行融合曲风。",
        genres: ["Mandopop", "R&B", "中国风"],
        topTracks: [
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
        albums: [
          {
            id: "17910751956",
            name: "七里香",
            artist: "周杰伦",
            cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80",
            publishYear: "2004",
            trackCount: 10,
            tracks: [],
          },
          {
            id: "17910751956",
            name: "叶惠美",
            artist: "周杰伦",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
            publishYear: "2003",
            trackCount: 11,
            tracks: [],
          },
        ],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}
