import { LyricsLine } from "@/types/lyrics";

/**
 * Parses standard LRC text into a sorted array of LyricsLine objects.
 * Supports formats: [mm:ss.xx], [mm:ss.xxx], [mm:ss]
 */
export function parseLrc(lrcText: string): LyricsLine[] {
  if (!lrcText || typeof lrcText !== "string") return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LyricsLine[] = [];
  const timeExp = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const text = line.replace(timeExp, "").trim();
    if (!text) continue;

    timeExp.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = timeExp.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, "0").substring(0, 3), 10)
        : 0;

      const time = minutes * 60 + seconds + milliseconds / 1000;
      result.push({ time, text });
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.time - b.time);
}
