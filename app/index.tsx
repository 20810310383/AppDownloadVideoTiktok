// app/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/mancho.png")}
        style={styles.bg}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <View style={styles.wrap}>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.9}
          onPress={() => router.replace("/(tabs)")}
        >
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
    height: 46,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    elevation: 1,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 20 },
});
