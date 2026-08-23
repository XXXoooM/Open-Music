import { create } from "zustand";

export type ApiSource = "qijieya" | "mikus";
export type MusicServer = "netease" | "tencent";
export type AudioQuality = "spatial" | "lossless" | "standard";

interface SettingsState {
  apiSource: ApiSource;
  musicServer: MusicServer;
  defaultPlaylistId: string;
  audioQuality: AudioQuality;

  setApiSource: (source: ApiSource) => void;
  setMusicServer: (server: MusicServer) => void;
  setDefaultPlaylistId: (id: string) => void;
  setAudioQuality: (quality: AudioQuality) => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  const savedSource = (typeof localStorage !== "undefined" ? localStorage.getItem("apple-api-source") : null) as ApiSource | null;
  const savedServer = (typeof localStorage !== "undefined" ? localStorage.getItem("apple-music-server") : null) as MusicServer | null;
  const savedPlaylistId = typeof localStorage !== "undefined" ? localStorage.getItem("apple-default-playlist-id") : null;
  const savedQuality = (typeof localStorage !== "undefined" ? localStorage.getItem("apple-audio-quality") : null) as AudioQuality | null;

  return {
    apiSource: savedSource || "qijieya",
    musicServer: savedServer || "netease",
    defaultPlaylistId: savedPlaylistId || "17910751956",
    audioQuality: savedQuality || "lossless",

    setApiSource: (source) => {
      localStorage.setItem("apple-api-source", source);
      set({ apiSource: source });
    },
    setMusicServer: (server) => {
      localStorage.setItem("apple-music-server", server);
      set({ musicServer: server });
    },
    setDefaultPlaylistId: (id) => {
      localStorage.setItem("apple-default-playlist-id", id);
      set({ defaultPlaylistId: id });
    },
    setAudioQuality: (quality) => {
      localStorage.setItem("apple-audio-quality", quality);
      set({ audioQuality: quality });
    },
  };
});
