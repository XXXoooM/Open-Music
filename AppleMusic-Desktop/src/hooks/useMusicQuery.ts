import { useQuery } from "@tanstack/react-query";
import { fetchOnlinePlaylist, searchOnlineTracks } from "@/api/musicClient";
import { useSettingsStore } from "@/stores/settingsStore";

export function usePlaylistQuery(playlistId?: string) {
  const { apiSource, musicServer, defaultPlaylistId } = useSettingsStore();
  const targetId = playlistId || defaultPlaylistId;

  return useQuery({
    queryKey: ["playlist", targetId, apiSource, musicServer],
    queryFn: () => fetchOnlinePlaylist(targetId, apiSource, musicServer),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useMusicSearchQuery(keyword: string) {
  const { apiSource, musicServer } = useSettingsStore();

  return useQuery({
    queryKey: ["search", keyword, apiSource, musicServer],
    queryFn: () => searchOnlineTracks(keyword, apiSource, musicServer, 30),
    enabled: !!keyword.trim(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
