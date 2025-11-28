import * as FileSystem from "expo-file-system/legacy";
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_SAVED_DIR = "user_saved_directory_uri";

// Convert buffer → base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return global.btoa(binary);
}

export async function saveRemoteFile(remoteUrl: string, fileName: string) {
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  const tmpPath =
    (FileSystem.cacheDirectory || FileSystem.documentDirectory) + safeName;

  // Tải file dạng arraybuffer
  const response = await axios.get(remoteUrl, {
    responseType: "arraybuffer",
    maxRedirects: 0,
    validateStatus: () => true,
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error("Redirect bị chặn để tránh mở browser.");
  }

  const base64 = arrayBufferToBase64(response.data);

  // Ghi file tạm
  await FileSystem.writeAsStringAsync(tmpPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // ---------- ANDROID: tự lưu vào thư mục đã chọn ----------
  if (Platform.OS === "android") {
    try {
      // 1. Lấy thư mục đã lưu từ lần trước
      const savedDir = await AsyncStorage.getItem(KEY_SAVED_DIR);

      let directoryUri = savedDir;

      // 2. Nếu chưa từng chọn → hỏi user chọn
      if (!directoryUri) {
        const perm =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!perm.granted) throw new Error("Bạn phải chọn thư mục để lưu.");

        directoryUri = perm.directoryUri;

        // Lưu lại để lần sau khỏi hỏi
        await AsyncStorage.setItem(KEY_SAVED_DIR, directoryUri);
      }

      // 3. Tạo file và ghi dữ liệu
      const mime = safeName.endsWith(".mp3") ? "audio/mpeg" : "video/mp4";

      const dest = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri!,
        safeName,
        mime
      );

      await FileSystem.writeAsStringAsync(dest, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return dest;
    } catch (err) {
      // Nếu lỗi do quyền thư mục → xóa và hỏi lại lần sau
      await AsyncStorage.removeItem(KEY_SAVED_DIR);
      throw err;
    }
  }

  // ---------- iOS: trả về file tạm ----------
  return tmpPath;
}

export async function resetSavedDirectory() {
  await AsyncStorage.removeItem("user_saved_directory_uri");
}
