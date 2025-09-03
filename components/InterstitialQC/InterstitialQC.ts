// components/InterstitialQC.ts
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL // ID test
  : "ca-app-pub-1853543743862045/4007225781"; // thay bằng id thật của bạn

let interstitial: InterstitialAd | null = null;

function createAd() {
  interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
}

export function show(callback?: () => void) {
  if (!interstitial) {
    createAd();
  }

  if (interstitial) {
    interstitial.load();

    const loaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial?.show();
    });

    const closed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      callback?.();
      createAd(); // chuẩn bị QC cho lần sau
    });

    // cleanup listeners sau 10s
    setTimeout(() => {
      loaded();
      closed();
    }, 10000);
  } else {
    callback?.();
  }
}
