// app/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/theme/ThemeProvider";

const KEY = "has_seen_welcome";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const [checking, setChecking] = useState(false);

  //   useEffect(() => {
  //     (async () => {
  //       const seen = await AsyncStorage.getItem(KEY);
  //       if (seen === "1") {
  //         router.replace("/(tabs)"); // nhảy thẳng vào Home nếu đã xem
  //       } else {
  //         setChecking(false);
  //       }
  //     })();
  //   }, []);

  if (checking) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("./../assets/images/mancho.png")} // đổi sang đường dẫn tương đối nếu bạn không dùng alias
      style={{ flex: 1 }}
      resizeMode="cover" // phủ full màn
    >
      <View style={styles.overlay} /> {/* nếu muốn làm tối ảnh nền */}
      <View style={styles.wrap}>
        {/* <Text style={[styles.appName, { color: "#fff" }]}>VidDown</Text>
        <Text style={[styles.sub, { color: "#e5e7eb" }]}>
          Tải video & âm thanh nhanh, gọn, không watermark.
        </Text> */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "rgba(239,68,68,0.95)" }]}
          onPress={async () => {
            // await AsyncStorage.setItem(KEY, "1");
            router.push("/(tabs)");
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  appName: { fontSize: 42, fontWeight: "900", letterSpacing: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 24,
    marginBottom: 80,
  },
  logo: { width: 140, height: 140, marginBottom: 14 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: 0.5 },
  sub: { textAlign: "center", marginTop: 8, lineHeight: 20 },
  btn: {
    marginTop: 24,
    paddingHorizontal: 28,
    height: 46,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    minWidth: 180,
    elevation: 1,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 20 },
});
