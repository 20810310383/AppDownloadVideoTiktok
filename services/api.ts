import axios from "axios";
import Constants from "expo-constants";

const API_BASE =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "";

export async function getInfo(url: string) {
  const res = await axios.get(`${API_BASE}/media/info`, { params: { url } });
  return res.data;
}
