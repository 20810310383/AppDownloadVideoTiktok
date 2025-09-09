// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import LottieView from "lottie-react-native";

export default function WelcomeScreen() {
  const [displayedText, setDisplayedText] = useState("");
  const animationRef = useRef<LottieView>(null);

  const fullText = "Tikpro Video Downloader\nNo watermark";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/manchoo.png")}
        style={styles.bg}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <View style={styles.wrap}>
        <Text style={styles.typewriterText}>{displayedText}</Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.9}
          onPress={() => router.replace("/(tabs)")}
        >
          {/* nút bắt đầu */}
          <Text style={styles.btnText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  btnText: { color: "#fff", fontWeight: "800", fontSize: 20 },

  typewriterText: {
    fontSize: 31,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 80, // khoảng cách so với nút
  },
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 24,
    marginBottom: 80,
  },
  btn: {
    backgroundColor: "rgba(239,68,68,0.95)",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    elevation: 1,
  },
});
