import { create } from "zustand";
import { Track } from "@/types/music";
import { invoke } from "@tauri-apps/api/core";
import { useHistoryStore } from "@/stores/historyStore";

export type PlayMode = "list-loop" | "single-loop" | "shuffle";

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;
  audioElement: HTMLAudioElement | null;

  // Actions
  initAudio: () => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  togglePlayMode: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  return {
    currentTrack: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.75,
    isMuted: false,
    playMode: "list-loop",
    audioElement: null,

    initAudio: () => {
      if (typeof window === "undefined" || get().audioElement) return;

      const audio = new Audio();
      audio.volume = get().volume;
      audio.preload = "auto";

      audio.addEventListener("timeupdate", () => {
        set({ currentTime: audio.currentTime });
      });

      audio.addEventListener("loadedmetadata", () => {
        set({ duration: audio.duration || 0 });
      });

      audio.addEventListener("ended", () => {
        const { playMode, next } = get();
        if (playMode === "single-loop") {
          audio.currentTime = 0;
          audio.play().catch(console.warn);
        } else {
          next();
        }
      });

      audio.addEventListener("error", (e) => {
        console.warn("Audio playback error:", e);
        set({ isPlaying: false });
      });

      set({ audioElement: audio });
    },

    playTrack: async (track: Track, newQueue?: Track[]) => {
      let audio = get().audioElement;
      if (!audio) {
        get().initAudio();
        audio = get().audioElement;
      }

      const queue = newQueue || (get().queue.length > 0 ? get().queue : [track]);
      const currentIndex = queue.findIndex((t) => t.id === track.id || t.url === track.url);

      set({
        currentTrack: track,
        queue,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,
        isPlaying: true,
        currentTime: 0,
      });

      // Record to playback history
      try {
        useHistoryStore.getState().addHistory(track);
      } catch (_) {}

      // Try invoking native Tauri audio command if available
      const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI__;
      if (isTauri) {
        try {
          await invoke("play_native_stream", { url: track.url });
        } catch (_) {
          // Fall back gracefully to HTML5 audio
        }
      }

      if (audio) {
        audio.src = track.url;
        audio.currentTime = 0;
        audio.play().catch((err) => {
          console.warn("Audio play blocked by browser policy:", err);
          set({ isPlaying: false });
        });
      }
    },

    togglePlay: () => {
      const { isPlaying, currentTrack, resume, pause } = get();
      if (!currentTrack) return;

      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    },

    pause: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
      }
      set({ isPlaying: false });
    },

    resume: () => {
      const { audioElement, currentTrack } = get();
      if (!currentTrack) return;
      if (audioElement) {
        audioElement.play().catch(console.warn);
      }
      set({ isPlaying: true });
    },

    seek: (seconds: number) => {
      const { audioElement, duration } = get();
      const safeTime = Math.max(0, Math.min(seconds, duration || seconds));
      if (audioElement) {
        audioElement.currentTime = safeTime;
      }
      set({ currentTime: safeTime });
    },

    setVolume: (level: number) => {
      const { audioElement } = get();
      const safeVol = Math.max(0, Math.min(1, level));
      if (audioElement) {
        audioElement.volume = safeVol;
        audioElement.muted = safeVol === 0;
      }
      set({ volume: safeVol, isMuted: safeVol === 0 });
    },

    toggleMute: () => {
      const { isMuted, audioElement } = get();
      if (audioElement) {
        audioElement.muted = !isMuted;
      }
      set({ isMuted: !isMuted });
    },

    next: () => {
      const { queue, currentIndex, playMode, playTrack } = get();
      if (queue.length === 0) return;

      let nextIndex = currentIndex + 1;
      if (playMode === "shuffle") {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (nextIndex >= queue.length) {
        nextIndex = 0;
      }

      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        playTrack(nextTrack);
      }
    },

    prev: () => {
      const { queue, currentIndex, currentTime, seek, playTrack } = get();
      if (queue.length === 0) return;

      // If playing over 3 seconds, reset to beginning of current track
      if (currentTime > 3) {
        seek(0);
        return;
      }

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }

      const prevTrack = queue[prevIndex];
      if (prevTrack) {
        playTrack(prevTrack);
      }
    },

    togglePlayMode: () => {
      const modes: PlayMode[] = ["list-loop", "single-loop", "shuffle"];
      const current = get().playMode;
      const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
      set({ playMode: nextMode });
    },
  };
});
