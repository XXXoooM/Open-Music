import { create } from "zustand";
import { Track } from "@/types/music";

export interface HistoryItem {
  track: Track;
  playedAt: string;
}

interface HistoryState {
  history: HistoryItem[];
  addHistory: (track: Track) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem("apple-playback-history") : null;
  const initialHistory: HistoryItem[] = saved ? JSON.parse(saved) : [];

  return {
    history: initialHistory,

    addHistory: (track: Track) => {
      const { history } = get();
      const filtered = history.filter((item) => item.track.id !== track.id);
      const newItem: HistoryItem = {
        track,
        playedAt: new Date().toISOString(),
      };
      const updated = [newItem, ...filtered].slice(0, 50); // Keep max 50 items

      localStorage.setItem("apple-playback-history", JSON.stringify(updated));
      set({ history: updated });
    },

    clearHistory: () => {
      localStorage.removeItem("apple-playback-history");
      set({ history: [] });
    },
  };
});
