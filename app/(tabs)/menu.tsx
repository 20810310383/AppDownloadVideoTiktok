import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Platform,
  Modal,
} from "react-native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLang } from "@/i18n/LanguageProvider";

/* ---------- constants / helpers ---------- */

const LINKS = {
  storeAndroid:
    "https://play.google.com/store/apps/details?id=com.dokhactu.downloadvideo",
  storeIOS: "https://apps.apple.com/app/idYOUR_ID",
  shareText:
    "Mình đang dùng TikPro Video Downloader để tải video cực nhanh. Thử nhé! https://snaptikpro.app",
  website: "https://snaptikpro.app",
};

const KEY_DIR = "downloadDirUri";

function formatBytes(n = 0) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

async function getCacheSize(): Promise<number> {
  const root = FileSystem.cacheDirectory!;
  const items = await FileSystem.readDirectoryAsync(root);
  let total = 0;
  await Promise.all(
    items.map(async (name) => {
      const info = await FileSystem.getInfoAsync(root + name);
      if (info.exists && info.size) total += info.size;
    })
  );
  return total;
}

async function clearCache(onDone?: (sizeCleared: number) => void) {
  try {
    const root = FileSystem.cacheDirectory!;
    const items = await FileSystem.readDirectoryAsync(root);
    let cleared = 0;
    await Promise.all(
      items.map(async (name) => {
        const path = root + name;
        const info = await FileSystem.getInfoAsync(path);
        await FileSystem.deleteAsync(path, { idempotent: true });
        if (info.exists && info.size) cleared += info.size;
      })
    );
    onDone?.(cleared);
    Alert.alert("Đã dọn dẹp", "Đã xoá các tệp tạm trong bộ nhớ cache.");
  } catch (e: any) {
    Alert.alert("Lỗi", e?.message || "Không xoá được tệp tạm.");
  }
}

async function pickAndroidFolder(setUri: (s: string) => void) {
  if (Platform.OS !== "android") return;
  try {
    const perm =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (perm.granted) {
      await AsyncStorage.setItem(KEY_DIR, perm.directoryUri);
      setUri(perm.directoryUri);
      Alert.alert("Thành công", "Đã chọn thư mục tải mặc định.");
    }
  } catch (e: any) {
    Alert.alert("Lỗi", e?.message || "Không chọn được thư mục.");
  }
}

/* ---------- atoms ---------- */

function Row({
  icon,
  label,
  right,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.icWrap}>{icon}</View>
      <Text style={styles.rowText}>{label}</Text>
      <View style={{ marginLeft: "auto" }}>{right}</View>
    </TouchableOpacity>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

/* ---------- reusable modal sheet ---------- */

function ModalSheet({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ maxHeight: "80%" }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- policy contents (VN) ---------- */

const LAST_UPDATED = "01/09/2025";

function PrivacyContent() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View>
      <Text style={styles.pText}>
        Chúng tôi tôn trọng quyền riêng tư của bạn. Ứng dụng VidDown chỉ dùng
        đường dẫn bạn cung cấp để tạo liên kết tải và{" "}
        <Text style={styles.pBold}>không</Text> thu thập nội dung video.
      </Text>
      <Text style={styles.h2}>1. Dữ liệu chúng tôi xử lý</Text>
      <Text style={styles.pBullet}>• Liên kết (URL) bạn nhập để tải.</Text>
      <Text style={styles.pBullet}>
        • Thông tin thiết bị cơ bản cho mục đích chẩn đoán lỗi (không nhận diện
        cá nhân).
      </Text>

      <Text style={styles.h2}>2. Lưu trữ</Text>
      <Text style={styles.pText}>
        Tệp tải về chỉ được lưu cục bộ trên thiết bị của bạn. Chúng tôi không
        lưu trữ trên máy chủ sau khi xử lý xong.
      </Text>

      <Text style={styles.h2}>3. Quyền truy cập</Text>
      <Text style={styles.pText}>
        Trên Android, bạn có thể chọn thư mục tải tuỳ ý. Chúng tôi chỉ truy cập
        thư mục bạn đã cấp quyền.
      </Text>

      <Text style={styles.h2}>4. Liên hệ</Text>
      <Text style={styles.pText}>
        Nếu có câu hỏi về quyền riêng tư, vui lòng liên hệ qua trang web chính
        thức.
      </Text>

      <Text style={styles.updated}>Cập nhật lần cuối: {LAST_UPDATED}</Text>
    </View>
  );
}

function TermsContent() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View>
      <Text style={styles.pText}>
        Bằng việc sử dụng VidDown, bạn đồng ý với các điều khoản dưới đây.
      </Text>

      <Text style={styles.h2}>1. Mục đích sử dụng</Text>
      <Text style={styles.pText}>
        Ứng dụng hỗ trợ tải nội dung để sử dụng cá nhân. Bạn chịu trách nhiệm
        đảm bảo việc tải tuân thủ bản quyền và điều khoản của nền tảng gốc.
      </Text>

      <Text style={styles.h2}>2. Trách nhiệm người dùng</Text>
      <Text style={styles.pBullet}>
        • Không sử dụng ứng dụng cho mục đích thương mại trái phép.
      </Text>
      <Text style={styles.pBullet}>
        • Không tải/buôn bán nội dung vi phạm pháp luật hoặc quyền của bên thứ
        ba.
      </Text>

      <Text style={styles.h2}>3. Giới hạn trách nhiệm</Text>
      <Text style={styles.pText}>
        Chúng tôi không chịu trách nhiệm với thiệt hại phát sinh do cách bạn sử
        dụng ứng dụng hoặc thay đổi từ phía nền tảng mạng xã hội.
      </Text>

      <Text style={styles.h2}>4. Thay đổi điều khoản</Text>
      <Text style={styles.pText}>
        Điều khoản có thể được cập nhật định kỳ. Tiếp tục sử dụng đồng nghĩa
        chấp nhận điều khoản mới.
      </Text>

      <Text style={styles.updated}>Cập nhật lần cuối: {LAST_UPDATED}</Text>
    </View>
  );
}

/* ---------- screen ---------- */

export default function MenuScreen() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { t } = useLang(); // <-- i18n
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [dirUri, setDirUri] = useState<string>("");
  const [cacheSize, setCacheSize] = useState<number>(0);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const version =
    (Constants.expoConfig as any)?.version ||
    (Constants.manifest2 as any)?.extra?.expoClient?.version ||
    "1.0.0";

  const storeUrl =
    Platform.OS === "android" ? LINKS.storeAndroid : LINKS.storeIOS;

  useEffect(() => {
    (async () => {
      const saved = (await AsyncStorage.getItem(KEY_DIR)) || "";
      setDirUri(saved);
      setCacheSize(await getCacheSize());
    })();
  }, []);

  return (
    <LinearGradient
      colors={theme.gradBg as [string, string, string]}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 36,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* top bar */}
          <View style={styles.topbar}>
            <TouchableOpacity
              style={[styles.circleBtn, { backgroundColor: theme.card }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.circleBtn, { backgroundColor: theme.card }]}
              onPress={toggle}
            >
              <Ionicons
                name={theme.name === "dark" ? "sunny-outline" : "moon-outline"}
                size={18}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          {/* QUICK ACTIONS */}
          <Section title={t("quickActions")}>
            {Platform.OS === "android" && (
              <>
                <Row
                  icon={
                    <MaterialIcons
                      name="folder-open"
                      size={20}
                      color={theme.text}
                    />
                  }
                  label={t("chooseFolder")}
                  right={
                    <Text style={styles.metaText} numberOfLines={1}>
                      {dirUri ? t("selectedLabel") : t("defaultLabel")}
                    </Text>
                  }
                  onPress={() => pickAndroidFolder(setDirUri)}
                />
                {dirUri ? (
                  <Row
                    icon={<Feather name="x-circle" size={20} color="#ef4444" />}
                    label={t("removeFolder")}
                    onPress={async () => {
                      await AsyncStorage.removeItem(KEY_DIR);
                      setDirUri("");
                    }}
                  />
                ) : null}
              </>
            )}

            <Row
              icon={<Feather name="trash-2" size={20} color="#dc2626" />}
              label={t("clearCache")}
              right={
                <Text style={styles.metaText}>{formatBytes(cacheSize)}</Text>
              }
              onPress={async () => {
                await clearCache(async () =>
                  setCacheSize(await getCacheSize())
                );
              }}
            />
          </Section>

          {/* APP */}
          <Section title={t("appSection")}>
            <Row
              icon={<Feather name="star" size={20} color="#f59e0b" />}
              label={t("rateApp")}
              onPress={() => {
                Alert.alert(
                  "Mở cửa hàng",
                  "Tính năng sẽ trỏ tới Store khi phát hành.",
                  [{ text: "OK" }]
                );
              }}
            />
            <Row
              icon={<Feather name="share-2" size={20} color={theme.text} />}
              label={t("shareWithFriends")}
              onPress={() => Share.share({ message: LINKS.shareText })}
            />
            <Row
              icon={
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={20}
                  color={theme.text}
                />
              }
              label={t("privacyPolicy")}
              onPress={() => setShowPrivacy(true)}
            />
            <Row
              icon={<Feather name="file-text" size={20} color={theme.text} />}
              label={t("termsOfUse")}
              onPress={() => setShowTerms(true)}
            />
            <Row
              icon={
                <Ionicons name="globe-outline" size={20} color={theme.text} />
              }
              label={t("website")}
              onPress={() => Alert.alert(t("website"), LINKS.website)}
            />
            <Row
              icon={
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={theme.text}
                />
              }
              label={t("about")}
              right={
                <Text style={styles.metaText}>
                  {t("versionPrefix")}
                  {version}
                </Text>
              }
            />
          </Section>
        </ScrollView>

        {/* MODALS */}
        <ModalSheet
          visible={showPrivacy}
          title={t("privacyPolicy")}
          onClose={() => setShowPrivacy(false)}
        >
          <PrivacyContent />
        </ModalSheet>

        <ModalSheet
          visible={showTerms}
          title={t("termsOfUse")}
          onClose={() => setShowTerms(false)}
        >
          <TermsContent />
        </ModalSheet>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const makeStyles = (t: any) =>
  StyleSheet.create({
    // layout
    topbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    circleBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
      borderWidth: t.name === "dark" ? 0 : StyleSheet.hairlineWidth,
      borderColor: t.border,
      elevation: t.name === "dark" ? 0 : 1,
      shadowOpacity: t.name === "dark" ? 0 : 0.05,
      shadowRadius: t.name === "dark" ? 0 : 8,
    },

    section: { marginTop: 14 },
    sectionTitle: { color: t.textMuted, marginBottom: 8, marginLeft: 4 },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      paddingVertical: 6,
      elevation: t.name === "dark" ? 0 : 1,
      shadowOpacity: t.name === "dark" ? 0 : 0.05,
      shadowRadius: t.name === "dark" ? 0 : 8,
      borderWidth: t.name === "dark" ? 0 : StyleSheet.hairlineWidth,
      borderColor: t.border,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
    },
    icWrap: { width: 30, alignItems: "center" },
    rowText: { marginLeft: 8, fontSize: 16, color: t.text, fontWeight: "500" },
    metaText: { color: t.textMuted },

    // modal
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    sheet: {
      width: "100%",
      borderRadius: 16,
      padding: 14,
      backgroundColor: t.card,
      borderWidth: t.name === "dark" ? 0 : StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    sheetTitle: { color: t.text, fontSize: 18, fontWeight: "800" },
    closeBtn: { position: "absolute", right: 2, top: 2, padding: 6 },

    // policy text
    h2: {
      color: t.text,
      fontSize: 16,
      fontWeight: "800",
      marginTop: 12,
      marginBottom: 6,
    },
    pText: { color: t.text, lineHeight: 20, marginBottom: 8 },
    pBold: { fontWeight: "800", color: t.text },
    pBullet: { color: t.text, lineHeight: 20, marginBottom: 4 },
    updated: { color: t.textMuted, marginTop: 12 },
  });
