export interface LyricsLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResponse {
  lrc: string;
  tlyric?: string;
  romalrc?: string;
}
