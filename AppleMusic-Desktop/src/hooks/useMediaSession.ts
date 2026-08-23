import { useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";

export function useMediaSession() {
  const { currentTrack, isPlaying, togglePlay, pause, resume, next, prev, seek } = usePlayerStore();

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artist,
        album: currentTrack.album || "Apple Music",
        artwork: [
          {
            src: currentTrack.pic,
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    navigator.mediaSession.setActionHandler("play", () => resume());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined && details.seekTime !== null) {
        seek(details.seekTime);
      }
    });

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      } catch (_) {}
    };
  }, [currentTrack, isPlaying, togglePlay, pause, resume, next, prev, seek]);
}
