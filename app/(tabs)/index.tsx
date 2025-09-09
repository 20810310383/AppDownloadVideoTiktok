import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MediaInfo } from "@/types";
import { saveRemoteFile } from "@/utils/files";
import { useTheme } from "@/theme/ThemeProvider";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLang,
  FLAGS,
  BRAND_LOGO,
  STRINGS,
  type LangCode,
} from "@/i18n/LanguageProvider";
import BannerQC from "@/components/BannerQC/BannerQC";
import * as InterstitialQC from "@/components/InterstitialQC/InterstitialQC";
// import { AdMobBanner, setTestDeviceIDAsync } from "expo-ads-admob";

const GUIDE_IMAGES = [
  require("../../assets/flags/hd1.jpg"),
  require("../../assets/flags/hd2.jpg"),
];
const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");

/* ================== backend helpers ================== */

const API_BASE =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "";

const isSupportedUrl = (u: string) =>
  /tiktok\.com|vt\.tiktok\.com/i.test(u || "");

type InfoResponse = {
  ok: boolean;
  data?: {
    title: string;
    author: string;
    duration?: number;
    cover?: string;
    platform?: string;
  };
  message?: string;
};

function buildDownloadUrl(srcUrl: string, type: "video" | "audio") {
  const u = new URL("/api/tiktok/download", API_BASE);
  u.searchParams.set("url", srcUrl);
  u.searchParams.set("type", type);
  return u.toString();
}

async function getInfo(srcUrl: string): Promise<InfoResponse> {
  const u = new URL("/api/tiktok/info", API_BASE);
  u.searchParams.set("url", srcUrl);
  const res = await fetch(u.toString());
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ================== screen ================== */

export default function HomeScreen() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [preview, setPreview] = useState<{ visible: boolean; src: any }>({
    visible: false,
    src: null,
  });

  const [langVisible, setLangVisible] = useState(false);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<MediaInfo | null>(null);
  const [saving, setSaving] = useState<null | "mp4" | "mp3">(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  const links = useMemo(() => {
    if (!meta || !url || !API_BASE) return null;
    return {
      mp4: buildDownloadUrl(url, "video"),
      mp3: buildDownloadUrl(url, "audio"),
      filenameBase: `${(meta.author || "video").slice(0, 40)}-${(
        meta.title || "file"
      ).slice(0, 60)}`,
    };
  }, [meta, url]);

  const onFetch = async () => {
    const u = url.trim();
    if (!u) return Alert.alert(t("missingLink"), t("pasteFirst"));
    if (!API_BASE) return Alert.alert(t("apiMissing"), t("cfgApi"));
    if (!isSupportedUrl(u))
      return Alert.alert(t("invalidLink"), t("onlyTiktok"));
    try {
      setLoading(true);
      const res = await getInfo(u);
      if (!res?.ok || !res?.data)
        throw new Error(res?.message || t("fetchErr"));
      setMeta({
        platform: res.data.platform ?? "tiktok",
        title: res.data.title,
        author: res.data.author,
        duration: res.data.duration ?? null,
        thumbnail: res.data.cover ?? null,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || t("fetchErr"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    Keyboard.dismiss();
    setUrl("");
    setMeta(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };
  const onPullRefresh = async () => {
    setRefreshing(true);
    await delay(700);
    setRefreshing(false);
    setTimeout(() => resetForm(), 120);
  };

  const openInBrowser = async (href?: string) => {
    if (!href) return;
    const can = await Linking.canOpenURL(href);
    if (can) Linking.openURL(href);
  };

  const saveFile = async (
    href?: string,
    name?: string,
    kind?: "mp4" | "mp3"
  ) => {
    if (!href || !name) return;
    try {
      setSaving(kind ?? null);
      const f = name.replace(/[^\w.\-]+/g, "_");
      await saveRemoteFile(href, f);
      if (Platform.OS === "android") Alert.alert(t("ok"), t("savedAndroid"));
      else Alert.alert(t("ok"), t("savedIOS"));
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Cannot save file.");
    } finally {
      setSaving(null);
    }
  };

  const chooseLang = async (code: LangCode) => {
    await setLang(code);
    setLangVisible(false);
  };

  const showAdThenSave = (href: string, name: string, kind: "mp4" | "mp3") => {
    setDownloadCount((prev) => {
      const newCount = prev + 1;

      // Nếu là lần thứ 3 → show QC
      if (newCount % 3 === 0) {
        // InterstitialQC.show(() => {
        //   saveFile(href, name, kind);
        // });

        saveFile(href, name, kind);
      } else {
        // tải thẳng
        saveFile(href, name, kind);
      }

      return newCount;
    });
  };

  return (
    <LinearGradient colors={theme.gradBg} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onPullRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          >
            {/* Top bar */}
            <View style={styles.topbar}>
              <View style={styles.brandRow}>
                {BRAND_LOGO[lang] ? (
                  <Image
                    source={BRAND_LOGO[lang] as any}
                    style={styles.brandLogo}
                  />
                ) : (
                  <View style={styles.logoDot} />
                )}
                <Text style={styles.brandLeft}>Tikpro</Text>
                <Text style={styles.brandRight}>Down</Text>
              </View>
              <View style={styles.topIcons}>
                <TouchableOpacity style={styles.topBtn} onPress={toggle}>
                  {theme.name === "dark" ? (
                    <Ionicons
                      name="sunny-outline"
                      size={18}
                      color={theme.text}
                    />
                  ) : (
                    <Ionicons
                      name="moon-outline"
                      size={18}
                      color={theme.text}
                    />
                  )}
                </TouchableOpacity>

                {/* Language button with flag */}
                <TouchableOpacity
                  style={[
                    styles.topBtn,
                    { marginLeft: 10, backgroundColor: theme.card },
                  ]}
                  onPress={() => setLangVisible(true)}
                >
                  {FLAGS[lang] ? (
                    <Image source={FLAGS[lang]} style={styles.flagIcon} />
                  ) : (
                    <Ionicons
                      name="language-outline"
                      size={18}
                      color={theme.text}
                    />
                  )}
                </TouchableOpacity>

                {/* Menu button */}
                <TouchableOpacity
                  style={[
                    styles.topBtn,
                    { marginLeft: 10, backgroundColor: theme.card },
                  ]}
                  onPress={() => router.push("/menu")}
                >
                  <Ionicons name="menu-outline" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* HERO */}
            <View style={styles.heroCard}>
              <LinearGradient
                colors={theme.gradHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGrad}
              >
                <Text style={styles.heroSmall}>{t("yourUltimate")}</Text>
                <Text style={styles.heroTitle}>{t("downloader")}</Text>
                <Text style={styles.heroDesc}>{t("heroDesc")}</Text>

                <View style={styles.inputWrap}>
                  <Ionicons
                    name="link-outline"
                    color={theme.textMuted}
                    size={18}
                  />
                  <TextInput
                    value={url}
                    onChangeText={setUrl}
                    placeholder={t("placeholder")}
                    placeholderTextColor={theme.textMuted}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                    onSubmitEditing={() => onFetch()}
                  />
                </View>

                <TouchableOpacity
                  disabled={loading}
                  onPress={onFetch}
                  style={[styles.btnDownload, loading && { opacity: 0.7 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnDownloadText}>{t("download")}</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Supported */}
            {/* <View style={styles.supportWrap}>
              <Text style={styles.supportTitle}>{t("supported")}</Text>
              <View style={styles.supportRow}>
                <View style={styles.badge}>
                  <FontAwesome5 name="tiktok" size={14} color={theme.text} />
                </View>
              </View>
            </View> */}

            {/* RESULT */}
            {meta && links && (
              <View style={styles.result}>
                {meta.thumbnail ? (
                  <Image
                    source={{ uri: meta.thumbnail }}
                    style={styles.thumb}
                  />
                ) : null}
                <Text style={styles.resTitle} numberOfLines={2}>
                  {meta.title || "Video"}
                </Text>
                <Text style={styles.resAuthor} numberOfLines={1}>
                  {meta.author}
                </Text>

                <View style={styles.sep} />

                {/* MP4 */}
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <MaterialIcons name="movie" size={20} color={theme.text} />
                    <Text style={styles.fileLabel}>{t("mp4")}</Text>
                  </View>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={() => openInBrowser(links.mp4)}
                    >
                      <Text style={styles.smallBtnText}>{t("open")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.smallBtn,
                        styles.smallBtnPrimary,
                        saving && { opacity: 0.7 },
                      ]}
                      disabled={!!saving}
                      //   onPress={() =>
                      //     saveFile(links.mp4, `${links.filenameBase}.mp4`, "mp4")
                      //   }
                      onPress={() =>
                        showAdThenSave(
                          links.mp4,
                          `${links.filenameBase}.mp4`,
                          "mp4"
                        )
                      }
                    >
                      {saving === "mp4" ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={[styles.smallBtnText, { color: "#fff" }]}>
                          {t("save")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* MP3 */}
                <View style={[styles.rowBetween, { marginTop: 10 }]}>
                  <View style={styles.row}>
                    <MaterialIcons
                      name="music-note"
                      size={20}
                      color={theme.text}
                    />
                    <Text style={styles.fileLabel}>{t("mp3")}</Text>
                  </View>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={() => openInBrowser(links.mp3)}
                    >
                      <Text style={styles.smallBtnText}>{t("open")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.smallBtn,
                        styles.smallBtnPrimary,
                        saving && { opacity: 0.7 },
                      ]}
                      disabled={!!saving}
                      //   onPress={() =>
                      //     saveFile(links.mp3, `${links.filenameBase}.mp3`, "mp3")
                      //   }
                      onPress={() =>
                        showAdThenSave(
                          links.mp3,
                          `${links.filenameBase}.mp3`,
                          "mp3"
                        )
                      }
                    >
                      {saving === "mp3" ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={[styles.smallBtnText, { color: "#fff" }]}>
                          {t("save")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Banner Ads */}
            {/* <BannerQC /> */}

            {/* tagline */}
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>{t("tagline")}</Text>
            </View>

            {/* HOW-TO (Copy link) */}
            <View style={styles.howtoWrap}>
              <Text style={styles.howtoTitle}>{t("howtoTitle")}</Text>

              {/* Slider ảnh */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const idx = Math.round(x / (SCREEN_W - 32)); // 16 padding hai bên
                  if (idx !== slideIndex) setSlideIndex(idx);
                }}
                scrollEventThrottle={16}
                style={styles.slider}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {GUIDE_IMAGES.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.85}
                    onPress={() => setPreview({ visible: true, src: img })}
                  >
                    <Image source={img} style={styles.slideImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Dots */}
              <View style={styles.dotsWrap}>
                {GUIDE_IMAGES.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === slideIndex && styles.dotActive]}
                  />
                ))}
              </View>

              {/* Steps */}
              <View style={{ marginTop: 10 }}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{t("step1Title")}</Text>
                    <Text style={styles.stepDesc}>{t("step1Desc")}</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{t("step2Title")}</Text>
                    <Text style={styles.stepDesc}>{t("step2Desc")}</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{t("step3Title")}</Text>
                    <Text style={styles.stepDesc}>{t("step3Desc")}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
        <View style={{ height: 42 }} />
      </KeyboardAvoidingView>

      {/* ---------- Language Modal ---------- */}
      <Modal
        transparent
        visible={langVisible}
        animationType="fade"
        onRequestClose={() => setLangVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("chooseLang")}</Text>

            {(
              [
                { code: "en", label: STRINGS.en.english },
                { code: "vi", label: STRINGS.vi.vietnamese },
                { code: "fr", label: STRINGS.fr.french },
                { code: "id", label: STRINGS.id.indonesian },
              ] as { code: LangCode; label: string }[]
            ).map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={styles.langRow}
                onPress={() => chooseLang(opt.code)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {FLAGS[opt.code] && (
                    <Image source={FLAGS[opt.code]} style={styles.flagIcon} />
                  )}
                  <Text style={[styles.langText, { marginLeft: 10 }]}>
                    {opt.label}
                  </Text>
                </View>
                {lang === opt.code ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={theme.primary}
                  />
                ) : null}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.langRow, { justifyContent: "center" }]}
              onPress={() => setLangVisible(false)}
            >
              <Text style={[styles.langText, { color: theme.textMuted }]}>
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview ảnh hướng dẫn */}
      {/* Preview ảnh hướng dẫn */}
      <Modal
        visible={preview.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setPreview({ visible: false, src: null })}
      >
        <View style={styles.previewOverlay}>
          {/* lớp click ra ngoài để đóng */}
          <TouchableOpacity
            style={styles.previewBackdrop}
            activeOpacity={1}
            onPress={() => setPreview({ visible: false, src: null })}
          />

          <View style={styles.previewContent}>
            {preview.src ? (
              <Image
                source={preview.src as any} // local require hoặc remote uri đều OK
                style={styles.previewImg}
                resizeMode="contain" // giữ đúng tỉ lệ ảnh
              />
            ) : null}

            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreview({ visible: false, src: null })}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ================== styles ================== */

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    scroll: { paddingBottom: 36 },

    topbar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brandRow: { flexDirection: "row", alignItems: "center" },
    brandLogo: { width: 28, height: 28, marginRight: 6, resizeMode: "contain" },
    logoDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: t.primary,
      marginRight: 6,
    },
    brandLeft: { fontSize: 18, fontWeight: "800", color: t.primary },
    brandRight: {
      fontSize: 18,
      fontWeight: "800",
      color: t.text,
      marginLeft: 2,
    },
    topIcons: { flexDirection: "row", alignItems: "center" },
    topBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
      elevation: 1,
    },
    flagIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      overflow: "hidden",
    },

    heroCard: { paddingHorizontal: 16, marginTop: 4 },
    heroGrad: { borderRadius: 28, padding: 18, overflow: "hidden" },
    heroSmall: { color: "#ffe5e5", fontWeight: "700", letterSpacing: 0.5 },
    heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 4 },
    heroDesc: {
      color: "#ffecec",
      opacity: 0.9,
      lineHeight: 18,
      marginTop: 8,
      marginBottom: 12,
    },

    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.inputBg,
      borderRadius: 22,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    input: { flex: 1, marginLeft: 8, color: t.text },
    btnDownload: {
      alignSelf: "center",
      marginTop: 14,
      backgroundColor: t.primary,
      paddingHorizontal: 28,
      height: 42,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    btnDownloadText: { color: "#fff", fontWeight: "800" },

    supportWrap: { alignItems: "center", marginTop: 14 },
    supportTitle: { color: t.textMuted, marginBottom: 8 },
    supportRow: { flexDirection: "row", alignItems: "center" },
    badge: {
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
      marginHorizontal: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },

    result: {
      marginTop: 16,
      marginHorizontal: 16,
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    thumb: {
      width: "100%",
      height: 170,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: "#1f2937",
    },
    resTitle: { fontSize: 16, fontWeight: "700", color: t.text },
    resAuthor: { color: t.textMuted, marginTop: 2 },
    sep: { height: 1, backgroundColor: t.border, marginVertical: 12 },
    row: { flexDirection: "row", alignItems: "center" },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    fileLabel: { marginLeft: 8, fontWeight: "600", color: t.text },
    smallBtn: {
      paddingHorizontal: 12,
      height: 32,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    smallBtnPrimary: { backgroundColor: t.primary, borderColor: t.primary },
    smallBtnText: { color: t.text, fontWeight: "700" },

    footer: { alignItems: "center", marginTop: 10 },
    footerTitle: { fontSize: 18, fontWeight: "800", color: t.text },

    /* modal */
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      paddingVertical: 8,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: t.text,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    langRow: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
    },
    langText: { color: t.text, fontWeight: "600" },

    howtoWrap: {
      marginTop: 16,
      marginHorizontal: 16,
      backgroundColor: t.card,
      borderRadius: 16,
      paddingVertical: 12,
      paddingBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    howtoTitle: {
      color: t.text,
      fontWeight: "800",
      fontSize: 16,
      paddingHorizontal: 14,
      marginBottom: 8,
    },
    slider: {
      width: "100%",
    },
    slideImage: {
      width: SCREEN_W - 32, // padding 16 mỗi bên
      height: (SCREEN_W - 32) * 0.56, // tỉ lệ 16:9
      borderRadius: 12,
      backgroundColor: "#1f2937",
      marginRight: 10,
    },
    dotsWrap: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.border,
      marginHorizontal: 4,
    },
    dotActive: {
      backgroundColor: t.primary,
      width: 16,
      borderRadius: 3,
    },

    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 14,
      marginTop: 10,
    },
    stepNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    stepNumText: { color: "#fff", fontWeight: "800", fontSize: 12 },
    stepTitle: { color: t.text, fontWeight: "800" },
    stepDesc: { color: t.textMuted, marginTop: 2, lineHeight: 18 },

    // preview modal
    previewOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    // previewClose: {
    //   position: "absolute",
    //   top: 24,
    //   right: 16,
    //   width: 36,
    //   height: 36,
    //   borderRadius: 18,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   backgroundColor: "rgba(0,0,0,0.35)",
    // },

    //     previewOverlay: {
    //   flex: 1,
    //   backgroundColor: "rgba(0,0,0,0.9)",
    //   justifyContent: "center",
    //   alignItems: "center",
    // },

    // lớp phía sau để nhận chạm đóng modal
    previewBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    // khung chứa ảnh + nút đóng
    previewContent: {
      width: SCREEN_W,
      alignItems: "center",
      justifyContent: "center",
    },

    // cho ảnh chiếm phần lớn màn, vẫn giữ tỉ lệ với 'contain'
    previewImg: {
      width: SCREEN_W,
      height: SCREEN_H * 0.8, // 80% chiều cao màn
    },

    previewClose: {
      position: "absolute",
      top: 24,
      right: 16,
      padding: 8,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.35)",
    },
  });
