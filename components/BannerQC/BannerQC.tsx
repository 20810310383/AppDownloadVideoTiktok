import React, { useEffect } from "react";
import { View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from "react-native-google-mobile-ads";

export default function BannerQC() {
  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <BannerAd
        unitId={TestIds.BANNER} // test ID
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
