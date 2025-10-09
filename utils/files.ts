// src/utils/files.ts
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export async function saveRemoteFile(
  remoteUrl: string,
  fileName: string
): Promise<string> {
  const safe = fileName.replace(/[^\w.\-]+/g, "_");
  const tmpPath =
    (FileSystem.cacheDirectory || FileSystem.documentDirectory)! + safe;

  // Tải về tạm
  const downloader = FileSystem.createDownloadResumable(remoteUrl, tmpPath);
  const result = await downloader.downloadAsync(); // result: FileSystemDownloadResult | undefined
  if (!result) throw new Error("Download failed or cancelled.");
  const uri = result.uri; // <-- giờ mới có type

  // Android: cố gắng lưu vào thư mục người dùng chọn
  if (Platform.OS === "android") {
    try {
      const perm =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (perm.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mime = safe.toLowerCase().endsWith(".mp3")
          ? "audio/mpeg"
          : "video/mp4";
        const dest = await FileSystem.StorageAccessFramework.createFileAsync(
          perm.directoryUri,
          safe,
          mime
        );
        await FileSystem.writeAsStringAsync(dest, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return dest; // trả về URI trong SAF
      }
    } catch {
      // bỏ qua, fallback Sharing
    }
  }

  // iOS & fallback: mở Share Sheet để người dùng lưu
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }

  // trả về đường dẫn tạm (nếu cần dùng tiếp)
  return uri;
}
