import { useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";

export function useKeyboardShortcuts() {
  const { togglePlay, next, prev, seek, setVolume, volume, currentTime, toggleMute, togglePlayMode } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyL":
          e.preventDefault();
          togglePlayMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, next, prev, seek, setVolume, volume, currentTime, toggleMute, togglePlayMode]);
}
