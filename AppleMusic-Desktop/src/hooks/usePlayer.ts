import { useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";

export function usePlayer() {
  const player = usePlayerStore();

  useEffect(() => {
    player.initAudio();
  }, []);

  return player;
}
