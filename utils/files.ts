// // src/utils/files.ts
// import * as FileSystem from "expo-file-system/legacy";
// import * as Sharing from "expo-sharing";
// import { Platform } from "react-native";

// export async function saveRemoteFile(
//   remoteUrl: string,
//   fileName: string
// ): Promise<string> {
//   const safe = fileName.replace(/[^\w.\-]+/g, "_");
//   const tmpPath =
//     (FileSystem.cacheDirectory || FileSystem.documentDirectory)! + safe;

//   // Tải về tạm
//   const downloader = FileSystem.createDownloadResumable(remoteUrl, tmpPath);
//   const result = await downloader.downloadAsync(); // result: FileSystemDownloadResult | undefined
//   if (!result) throw new Error("Download failed or cancelled.");
//   const uri = result.uri; // <-- giờ mới có type

//   // Android: cố gắng lưu vào thư mục người dùng chọn
//   if (Platform.OS === "android") {
//     try {
//       const perm =
//         await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
//       if (perm.granted) {
//         const base64 = await FileSystem.readAsStringAsync(uri, {
//           encoding: FileSystem.EncodingType.Base64,
//         });
//         const mime = safe.toLowerCase().endsWith(".mp3")
//           ? "audio/mpeg"
//           : "video/mp4";
//         const dest = await FileSystem.StorageAccessFramework.createFileAsync(
//           perm.directoryUri,
//           safe,
//           mime
//         );
//         await FileSystem.writeAsStringAsync(dest, base64, {
//           encoding: FileSystem.EncodingType.Base64,
//         });
//         return dest; // trả về URI trong SAF
//       }
//     } catch {
//       // bỏ qua, fallback Sharing
//     }
//   }

//   // iOS & fallback: mở Share Sheet để người dùng lưu
//   if (await Sharing.isAvailableAsync()) {
//     await Sharing.shareAsync(uri);
//   }

//   // trả về đường dẫn tạm (nếu cần dùng tiếp)
//   return uri;
// }

import * as FileSystem from "expo-file-system/legacy";
import axios from "axios";
import { Platform } from "react-native";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return global.btoa(binary);
}

export async function saveRemoteFile(remoteUrl: string, fileName: string) {
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  const tmpPath =
    (FileSystem.cacheDirectory || FileSystem.documentDirectory) + safeName;

  // Không follow redirect
  const response = await axios.get(remoteUrl, {
    responseType: "arraybuffer",
    maxRedirects: 0,
    validateStatus: () => true,
  });

  // Nếu backend trả redirect → lỗi
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Backend redirect — blocked để tránh mở browser.");
  }

  const base64 = arrayBufferToBase64(response.data);

  // Lưu vào cache tạm
  await FileSystem.writeAsStringAsync(tmpPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Android: Lưu thẳng vào thư mục user chọn
  if (Platform.OS === "android") {
    const perm =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (perm.granted) {
      const mime = safeName.endsWith(".mp3") ? "audio/mpeg" : "video/mp4";

      const dest = await FileSystem.StorageAccessFramework.createFileAsync(
        perm.directoryUri,
        safeName,
        mime
      );

      await FileSystem.writeAsStringAsync(dest, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return dest;
    }
  }

  // iOS: trả về file tạm
  return tmpPath;
}
