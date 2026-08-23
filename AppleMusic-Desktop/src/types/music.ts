export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  pic: string;
  url: string;
  lrc?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover: string;
  trackCount: number;
  playCount?: number;
  creator?: {
    nickname: string;
    avatarUrl?: string;
  };
  tracks?: Track[];
}
