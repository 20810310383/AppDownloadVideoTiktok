import axios from "axios";
import Constants from "expo-constants";

const API_BASE =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "";

export function buildDownloadUrl(
  url: string,
  type: "video" | "audio" = "video"
) {
  const u = new URL("/api/tiktok/download", API_BASE);
  u.searchParams.set("url", url);
  u.searchParams.set("type", type);
  return u.toString();
}

export async function fetchTikTokInfo(url: string) {
  const u = new URL("/api/tiktok/info", API_BASE);
  u.searchParams.set("url", url);
  const res = await axios.get(u.toString());
  return res.data as {
    ok: boolean;
    data?: {
      title: string;
      author: string;
      duration?: number;
      cover?: string;
      videoHD?: string;
      videoNoWM?: string;
      music?: string;
    };
    message?: string;
  };
}
