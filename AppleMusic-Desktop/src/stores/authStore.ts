import { create } from "zustand";
import { AuthState, UserProfile } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("apple-music-token") : null;
  const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("apple-music-user") : null;

  return {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: !!savedToken,
    login: (token: string, user: UserProfile) => {
      localStorage.setItem("apple-music-token", token);
      localStorage.setItem("apple-music-user", JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("apple-music-token");
      localStorage.removeItem("apple-music-user");
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
