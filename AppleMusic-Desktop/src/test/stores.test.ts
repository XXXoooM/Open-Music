import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/stores/themeStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Track } from "@/types/music";

describe("Apple Music Zustand Stores Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("useThemeStore", () => {
    it("should toggle theme between light and dark", () => {
      const { setMode, toggleTheme } = useThemeStore.getState();
      setMode("light");
      expect(useThemeStore.getState().resolvedTheme).toBe("light");

      toggleTheme();
      expect(useThemeStore.getState().resolvedTheme).toBe("dark");

      toggleTheme();
      expect(useThemeStore.getState().resolvedTheme).toBe("light");
    });
  });

  describe("usePlaylistStore", () => {
    it("should create a new playlist and add to custom playlists", () => {
      const { createPlaylist } = usePlaylistStore.getState();
      const initialCount = usePlaylistStore.getState().customPlaylists.length;

      const newPl = createPlaylist("周杰伦黄金经典", "个人精选");
      expect(newPl.title).toBe("周杰伦黄金经典");
      expect(usePlaylistStore.getState().customPlaylists.length).toBe(initialCount + 1);
    });

    it("should toggle track favorite status", () => {
      const { toggleFavorite, isFavorite } = usePlaylistStore.getState();
      const testTrack: Track = {
        id: "test-track-1",
        name: "七里香",
        artist: "周杰伦",
        pic: "https://example.com/pic.jpg",
        url: "https://example.com/audio.mp3",
      };

      const isFav1 = toggleFavorite(testTrack);
      expect(isFav1).toBe(true);
      expect(isFavorite("test-track-1")).toBe(true);

      const isFav2 = toggleFavorite(testTrack);
      expect(isFav2).toBe(false);
      expect(isFavorite("test-track-1")).toBe(false);
    });
  });

  describe("useAuthStore", () => {
    it("should handle login and logout correctly", () => {
      const { login, logout } = useAuthStore.getState();

      login("mock-token-123", {
        id: "u-1",
        nickname: "Steve",
        email: "steve@apple.com",
        avatarUrl: "https://example.com/avatar.jpg",
        membership: "apple-music-plus",
        joinedAt: new Date().toISOString(),
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("useSettingsStore & Meting Client", () => {
    it("should switch between qijieya and mikus api sources", () => {
      const { setApiSource, setMusicServer } = useSettingsStore.getState();

      setApiSource("mikus");
      expect(useSettingsStore.getState().apiSource).toBe("mikus");

      setMusicServer("tencent");
      expect(useSettingsStore.getState().musicServer).toBe("tencent");
    });
  });
});

