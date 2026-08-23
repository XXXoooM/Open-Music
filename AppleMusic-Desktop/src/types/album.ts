import { Track } from "./music";

export interface Album {
  id: string;
  name: string;
  artist: string;
  cover: string;
  publishYear?: string | number;
  trackCount: number;
  description?: string;
  company?: string;
  tracks: Track[];
}
