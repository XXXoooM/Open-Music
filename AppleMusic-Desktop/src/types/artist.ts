import { Track } from "./music";
import { Album } from "./album";

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  monthlyListeners?: string;
  verified?: boolean;
  bio?: string;
  genres?: string[];
  topTracks: Track[];
  albums: Album[];
}
