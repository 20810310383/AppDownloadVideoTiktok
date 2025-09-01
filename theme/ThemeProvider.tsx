// src/theme/ThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorValue } from "react-native";

export type ThemeName = "light" | "dark";

// Tuple gradient: tối thiểu 2 màu, readonly
type GradientStops = Readonly<[ColorValue, ColorValue, ...ColorValue[]]>;

type Palette = {
  name: ThemeName;
  // base colors
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  inputBg: string;
  primary: string;
  // gradients (tuple readonly)
  gradBg: GradientStops; // nền màn hình
  gradHero: GradientStops; // hero card
};

const light: Palette = {
  name: "light",
  bg: "#F2F3F5",
  card: "#FFFFFF",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  inputBg: "#FFFFFF",
  primary: "#ef4444",
  gradBg: ["#ffffff", "#eef2ff"] as const,
  gradHero: ["#f43f5e", "#7c3aed"] as const,
};

const dark: Palette = {
  name: "dark",
  bg: "#0b1020",
  card: "rgba(255,255,255,0.06)",
  text: "#F9FAFB",
  textMuted: "#A7B0C0",
  border: "rgba(255,255,255,0.12)",
  inputBg: "rgba(255,255,255,0.12)",
  primary: "#f87171",
  // tím → xanh như mockup
  gradBg: ["#0b1020", "#2a1e47", "#143e5f"] as const,
  gradHero: ["#ef4444", "#7c3aed"] as const,
};

const KEY = "app.theme";

type Ctx = {
  theme: Palette;
  setTheme: (n: ThemeName) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = Appearance.getColorScheme();
  const defaultName: ThemeName = sys === "dark" ? "dark" : "light";

  const [name, setName] = useState<ThemeName>(defaultName);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") setName(saved);
    })();
  }, []);

  const theme = useMemo(() => (name === "dark" ? dark : light), [name]);

  const setTheme = (n: ThemeName) => {
    setName(n);
    AsyncStorage.setItem(KEY, n).catch(() => {});
  };
  const toggle = () => setTheme(name === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider/>");
  return ctx;
}
