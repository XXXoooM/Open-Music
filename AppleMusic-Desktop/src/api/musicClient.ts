import { invoke } from "@tauri-apps/api/core";
import { Playlist, Track } from "@/types/music";
import { ApiSource, MusicServer } from "@/stores/settingsStore";

export interface MetingSourceConfig {
  id: ApiSource;
  name: string;
  baseUrl: string;
  desc: string;
}

export const METING_SOURCES: Record<ApiSource, MetingSourceConfig> = {
  qijieya: {
    id: "qijieya",
    name: "线路一 (祈杰のMeting / VIP解析)",
    baseUrl: "https://api.qijieya.cn/meting/",
    desc: "支持网易云VIP解析与高清音质",
  },
  mikus: {
    id: "mikus",
    name: "线路二 (Meting-API / mikus.ink)",
    baseUrl: "https://meting.mikus.ink/api",
    desc: "高可用官方分布式镜像线路",
  },
};

export function buildMetingUrl(
  source: ApiSource,
  server: MusicServer,
  type: string,
  id: string,
  extraParams?: Record<string, string | number>
): string {
  const config = METING_SOURCES[source] || METING_SOURCES.qijieya;
  const url = new URL(config.baseUrl);

  url.searchParams.set("server", server);
  url.searchParams.set("type", type);
  url.searchParams.set("id", id);

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  return url.toString();
}

export function normalizeTrackUrl(rawUrl: string, source: ApiSource): string {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const config = METING_SOURCES[source] || METING_SOURCES.qijieya;
  const origin = new URL(config.baseUrl).origin;
  if (rawUrl.startsWith("/")) {
    return origin + rawUrl;
  }
  return config.baseUrl + (config.baseUrl.endsWith("/") ? "" : "/") + rawUrl;
}

export function parseRawMetingItem(item: any, source: ApiSource): Track {
  const trackId = String(item.id || item.song_id || item.mid || Math.random().toString(36).substring(2, 9));
  const name = item.name || item.title || "未知曲目";
  const artist = item.artist || item.author || (Array.isArray(item.artists) ? item.artists.map((a: any) => a.name).join("/") : "未知歌手");
  const album = item.album || item.album_name || (typeof item.pic === "string" ? "单曲精选" : undefined);
  const pic = normalizeTrackUrl(item.pic || item.cover || item.image || "", source);
  const url = normalizeTrackUrl(item.url || item.mp3 || item.src || "", source);
  const lrc = normalizeTrackUrl(item.lrc || item.lyric || "", source);

  return {
    id: trackId,
    name,
    artist,
    album,
    pic: pic || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80",
    url,
    lrc,
    duration: typeof item.duration === "number" ? item.duration : undefined,
  };
}

export async function fetchOnlinePlaylist(
  playlistId: string,
  source: ApiSource = "qijieya",
  server: MusicServer = "netease"
): Promise<Playlist> {
  const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;

  // 1. Try Rust backend proxy first
  if (isTauri) {
    try {
      const data = await invoke<Playlist>("fetch_playlist_tracks", {
        source,
        server,
        playlistId,
      });
      if (data && data.tracks && data.tracks.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("[Tauri Proxy] fetch_playlist_tracks error, trying web fetch:", err);
    }
  }

  // 2. Direct Web Fetch with Fallback
  const sourcesToTry: ApiSource[] = source === "qijieya" ? ["qijieya", "mikus"] : ["mikus", "qijieya"];

  for (const currentSrc of sourcesToTry) {
    try {
      const targetUrl = buildMetingUrl(currentSrc, server, "playlist", playlistId);
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const tracks = data.map((item: any) => parseRawMetingItem(item, currentSrc));
        return {
          id: playlistId,
          title: server === "netease" ? "网易云精选歌单 · Spatial Audio" : "QQ音乐热门歌单",
          description: "由 Meting-API 多线路极速解析提供的高品质音乐流。",
          cover: tracks[0]?.pic || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
          trackCount: tracks.length,
          creator: { nickname: `Apple Music (${currentSrc === "qijieya" ? "祈杰源" : "Mikus源"})` },
          tracks,
        };
      }
    } catch (e) {
      console.warn(`[Meting API] Source ${currentSrc} failed for playlist ${playlistId}:`, e);
    }
  }

  // 3. Fallback mock if completely offline
  return {
    id: playlistId,
    title: "Apple Spatial Audio 空间音频精选 (离线模式)",
    description: "网络请求超时，已切换至本地预载高保真音频列表。",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    trackCount: 2,
    creator: { nickname: "Apple Music 官方编辑" },
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
}

export async function searchOnlineTracks(
  keyword: string,
  source: ApiSource = "qijieya",
  server: MusicServer = "netease",
  limit: number = 20
): Promise<Track[]> {
  if (!keyword.trim()) return [];

  const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;

  // 1. Try Rust backend proxy first
  if (isTauri) {
    try {
      const data = await invoke<Track[]>("search_music_tracks", {
        source,
        server,
        keyword,
        limit,
      });
      if (data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("[Tauri Proxy] search_music_tracks error, falling back to web fetch:", err);
    }
  }

  // 2. Direct Web Fetch with Fallback
  const sourcesToTry: ApiSource[] = source === "qijieya" ? ["qijieya", "mikus"] : ["mikus", "qijieya"];

  for (const currentSrc of sourcesToTry) {
    try {
      const targetUrl = buildMetingUrl(currentSrc, server, "search", keyword, { limit });
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => parseRawMetingItem(item, currentSrc));
      }
    } catch (e) {
      console.warn(`[Meting Search] Source ${currentSrc} failed for keyword '${keyword}':`, e);
    }
  }

  return [];
}
