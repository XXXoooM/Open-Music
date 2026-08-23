import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Track } from "@/types/music";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useHistoryStore, HistoryItem } from "@/stores/historyStore";

export function useFavoritesQuery() {
  const { favoriteTracks } = usePlaylistStore();

  return useQuery<Track[]>({
    queryKey: ["favorites", favoriteTracks.length],
    queryFn: async () => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
      if (isTauri) {
        try {
          const res = await invoke<Track[]>("get_favorites");
          if (res && Array.isArray(res)) return res;
        } catch (_) {}
      }
      return favoriteTracks;
    },
    staleTime: 0,
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  const { toggleFavorite } = usePlaylistStore();

  return useMutation({
    mutationFn: async (track: Track) => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
      if (isTauri) {
        try {
          await invoke("toggle_favorite", { trackId: track.id });
        } catch (_) {}
      }
      toggleFavorite(track);
      return track;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useHistoryQuery(limit: number = 50) {
  const { history } = useHistoryStore();

  return useQuery<HistoryItem[]>({
    queryKey: ["history", history.length, limit],
    queryFn: async () => {
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
      if (isTauri) {
        try {
          const res = await invoke<HistoryItem[]>("get_history", { limit });
          if (res && Array.isArray(res)) return res;
        } catch (_) {}
      }
      return history.slice(0, limit);
    },
    staleTime: 0,
  });
}
