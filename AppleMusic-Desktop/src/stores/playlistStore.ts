import { create } from "zustand";
import { Playlist, Track } from "@/types/music";

interface PlaylistState {
  customPlaylists: Playlist[];
  favoriteTracks: Track[];
  selectedPlaylistId: string | null;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;
  activeView: "listen-now" | "radio" | "charts" | "favorites" | "search" | "playlist-detail" | "lyrics" | "album" | "artist" | "profile";
  searchQuery: string;

  // Actions
  setActiveView: (view: "listen-now" | "radio" | "charts" | "favorites" | "search" | "playlist-detail" | "lyrics" | "album" | "artist" | "profile", resourceId?: string) => void;
  setSearchQuery: (query: string) => void;
  createPlaylist: (title: string, description?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  toggleFavorite: (track: Track) => boolean;
  isFavorite: (trackId: string) => boolean;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => {
  const savedPlaylists = typeof localStorage !== "undefined" ? localStorage.getItem("apple-custom-playlists") : null;
  const savedFavorites = typeof localStorage !== "undefined" ? localStorage.getItem("apple-favorite-tracks") : null;

  const defaultPlaylists: Playlist[] = [
    {
      id: "pl-chinese-pop",
      title: "华语精选流行",
      description: "跨越时代的华语经典与新潮流行旋律。",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      trackCount: 2,
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
    },
    {
      id: "pl-study-focus",
      title: "深夜沉浸学习",
      description: "助你保持深度专注的 Ambient 与轻音乐精选。",
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
      trackCount: 1,
      tracks: [
        {
          id: "t-3",
          name: "Blinding Lights",
          artist: "The Weeknd",
          album: "After Hours",
          pic: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
          url: "https://music.163.com/song/media/outer/url?id=1407551413.mp3",
          duration: 200,
        },
      ],
    },
  ];

  return {
    customPlaylists: savedPlaylists ? JSON.parse(savedPlaylists) : defaultPlaylists,
    favoriteTracks: savedFavorites ? JSON.parse(savedFavorites) : [],
    selectedPlaylistId: null,
    selectedAlbumId: null,
    selectedArtistId: null,
    activeView: "listen-now",
    searchQuery: "",

    setActiveView: (view, resourceId) => {
      set({
        activeView: view,
        selectedPlaylistId: view === "playlist-detail" ? resourceId || null : null,
        selectedAlbumId: view === "album" ? resourceId || null : null,
        selectedArtistId: view === "artist" ? resourceId || null : null,
      });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    createPlaylist: (title, description) => {
      const newPlaylist: Playlist = {
        id: "pl-custom-" + Date.now(),
        title,
        description: description || "用户自建歌单",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
        trackCount: 0,
        tracks: [],
      };

      const updated = [newPlaylist, ...get().customPlaylists];
      localStorage.setItem("apple-custom-playlists", JSON.stringify(updated));
      set({ customPlaylists: updated });
      return newPlaylist;
    },

    addTrackToPlaylist: (playlistId, track) => {
      const updated = get().customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.tracks?.some((t) => t.id === track.id);
          if (exists) return pl;
          const newTracks = [track, ...(pl.tracks || [])];
          return { ...pl, tracks: newTracks, trackCount: newTracks.length };
        }
        return pl;
      });

      localStorage.setItem("apple-custom-playlists", JSON.stringify(updated));
      set({ customPlaylists: updated });
    },

    removeTrackFromPlaylist: (playlistId, trackId) => {
      const updated = get().customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const newTracks = (pl.tracks || []).filter((t) => t.id !== trackId);
          return { ...pl, tracks: newTracks, trackCount: newTracks.length };
        }
        return pl;
      });

      localStorage.setItem("apple-custom-playlists", JSON.stringify(updated));
      set({ customPlaylists: updated });
    },

    toggleFavorite: (track) => {
      const { favoriteTracks } = get();
      const index = favoriteTracks.findIndex((t) => t.id === track.id || t.url === track.url);
      let nextFavs: Track[];
      let isNowFav = false;

      if (index >= 0) {
        nextFavs = favoriteTracks.filter((_, i) => i !== index);
        isNowFav = false;
      } else {
        nextFavs = [track, ...favoriteTracks];
        isNowFav = true;
      }

      localStorage.setItem("apple-favorite-tracks", JSON.stringify(nextFavs));
      set({ favoriteTracks: nextFavs });
      return isNowFav;
    },

    isFavorite: (trackId) => {
      return get().favoriteTracks.some((t) => t.id === trackId);
    },
  };
});
