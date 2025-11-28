// components/ToastConfig.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={styles.containerSuccess}>
      <Ionicons name="checkmark-circle" size={28} color="#fff" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View style={styles.containerError}>
      <Ionicons name="close-circle" size={28} color="#fff" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),

  info: ({ text1, text2 }: any) => (
    <View style={styles.containerInfo}>
      <Ionicons name="information-circle" size={28} color="#fff" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  containerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#22c55e", // xanh lá kiểu iOS
    elevation: 3,
  },
  containerError: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#ef4444", // đỏ đẹp
    elevation: 3,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  message: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#3B82F6", // xanh dương info
    elevation: 3,
  },
});
