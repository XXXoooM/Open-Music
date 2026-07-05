export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover: string;
  url: string;
  lrc: string;
  duration: number; // Duration in seconds (will be filled by AVPlayer on prepare)
}

export interface Playlist {
  id: string;
  name: string;
  coverImgUrl: string;
  description?: string;
  tracks: Track[];
}
