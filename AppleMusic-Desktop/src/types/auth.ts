export interface UserProfile {
  id: string;
  nickname: string;
  email?: string;
  avatarUrl: string;
  membership: "standard" | "apple-music-plus" | "spatial-vip";
  joinedAt: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}
