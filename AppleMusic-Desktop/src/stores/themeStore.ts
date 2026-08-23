import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedMode = (localStorage.getItem("app-theme-mode") as ThemeMode) || "system";
  const initialResolved = savedMode === "system" ? getSystemTheme() : savedMode;

  const applyTheme = (theme: "light" | "dark") => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Initial application
  if (typeof window !== "undefined") {
    applyTheme(initialResolved);

    // Listen to OS theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (get().mode === "system") {
        const next = e.matches ? "dark" : "light";
        set({ resolvedTheme: next });
        applyTheme(next);
      }
    });
  }

  return {
    mode: savedMode,
    resolvedTheme: initialResolved,
    setMode: (mode) => {
      const resolved = mode === "system" ? getSystemTheme() : mode;
      localStorage.setItem("app-theme-mode", mode);
      applyTheme(resolved);
      set({ mode, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const next = current === "dark" ? "light" : "dark";
      get().setMode(next);
    },
  };
});
