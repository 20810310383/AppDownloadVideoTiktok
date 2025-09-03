import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { AdMobBanner, setTestDeviceIDAsync } from "expo-ads-admob";

export default function TestAdBanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Đặt test device ID (quan trọng để tránh bị ban)
    const initAdmob = async () => {
      await setTestDeviceIDAsync("EMULATOR");
      setReady(true);
    };
    initAdmob();
  }, []);

  if (!ready) return null;

  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="banner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID của Google
        servePersonalizedAds // true: quảng cáo cá nhân hoá
        onDidFailToReceiveAdWithError={(err) => console.log("Ad error: ", err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
});
