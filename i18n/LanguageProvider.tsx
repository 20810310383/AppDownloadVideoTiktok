import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LangCode = "en" | "vi" | "fr" | "id";
const LANG_KEY = "app.lang";

/** --- ẢNH CỜ / LOGO --- */
export const FLAGS: Record<LangCode, any> = {
  en: require("@/assets/flags/en.png"),
  vi: require("@/assets/flags/vi.png"),
  fr: require("@/assets/flags/fr.png"),
  id: require("@/assets/flags/id.png"),
};

// tuỳ chọn: logo thương hiệu theo vùng (nếu bạn có file)
// nếu chưa có, cứ để comment để app tự fallback chữ "VidDown"
export const BRAND_LOGO: Partial<Record<LangCode, any>> = {
  // en: require("@/assets/brand/en.png"),
  // vi: require("@/assets/brand/vi.png"),
  // fr: require("@/assets/brand/fr.png"),
  // id: require("@/assets/brand/id.png"),
};

/** --- STRINGS chung cho 2 màn --- */
export const STRINGS: Record<LangCode, Record<string, string>> = {
  en: {
    // Home
    yourUltimate: "Your Ultimate",
    downloader: "Downloader",
    heroDesc:
      "VidDown lets you download videos instantly with speed and ease. No hassle—just seamless, uninterrupted entertainment at your fingertips!",
    placeholder: "insert your video link here...",
    download: "Download",
    pleaseWait: "Please wait…",
    supported: "Supported Platforms:",
    mp4: "MP4 (no logo)",
    mp3: "MP3 (audio)",
    open: "Open",
    save: "Save",
    tagline: "Video Downloader",
    missingLink: "Missing link",
    pasteFirst: "Paste a TikTok link first!",
    apiMissing: "API missing",
    cfgApi: "Backend API_BASE_URL is not configured.",
    invalidLink: "Invalid link",
    onlyTiktok: "Currently this API supports TikTok only.",
    fetchErr: "Failed to fetch video info.",
    savedAndroid: "File has been saved to your chosen folder / or shared.",
    savedIOS: "Open Share Sheet to save to Files/Photos.",
    ok: "OK",
    chooseLang: "Choose language",
    english: "English",
    vietnamese: "Tiếng Việt",
    french: "Français",
    indonesian: "Bahasa Indonesia",
    cancel: "Cancel",

    // Menu
    quickActions: "Quick actions",
    chooseFolder: "Choose download folder (Android)",
    removeFolder: "Clear chosen folder",
    defaultLabel: "Default",
    selectedLabel: "Selected",
    clearCache: "Clear cache files",
    appSection: "App",
    rateApp: "Rate app",
    shareWithFriends: "Share with friends",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    website: "Website",
    about: "About",
    versionPrefix: "v",

    howtoTitle: "How to copy the link",
    step1Title: "Open the video on TikTok",
    step1Desc: "Go to the TikTok app and open the video you want to download.",
    step2Title: "Tap Share → Copy link",
    step2Desc: "Use the Share button and choose Copy link to get the URL.",
    step3Title: "Paste into VidDown",
    step3Desc: "Paste the link into the box above and tap Download.",
  },
  vi: {
    // Home
    yourUltimate: "Công cụ",
    downloader: "Tải xuống",
    heroDesc:
      "VidDown giúp bạn tải video cực nhanh và đơn giản. Không phiền phức—trải nghiệm giải trí mượt mà trong tầm tay!",
    placeholder: "dán liên kết video vào đây...",
    download: "Tải xuống",
    pleaseWait: "Đang xử lý…",
    supported: "Nền tảng hỗ trợ:",
    mp4: "MP4 (không logo)",
    mp3: "MP3 (nhạc nền)",
    open: "Mở",
    save: "Lưu",
    tagline: "Trình tải video",
    missingLink: "Thiếu liên kết",
    pasteFirst: "Hãy dán link TikTok trước đã nhé!",
    apiMissing: "Thiếu API",
    cfgApi: "Chưa cấu hình API_BASE_URL cho backend.",
    invalidLink: "Link không hợp lệ",
    onlyTiktok: "Hiện API này chỉ hỗ trợ TikTok.",
    fetchErr: "Không lấy được thông tin video.",
    savedAndroid: "Tệp đã lưu vào thư mục bạn chọn / hoặc chia sẻ.",
    savedIOS: "Mở Share Sheet để lưu vào Files/Photos.",
    ok: "Đồng ý",
    chooseLang: "Chọn ngôn ngữ",
    english: "English",
    vietnamese: "Tiếng Việt",
    french: "Français",
    indonesian: "Bahasa Indonesia",
    cancel: "Hủy",

    // Menu
    quickActions: "Thao tác nhanh",
    chooseFolder: "Chọn thư mục tải (Android)",
    removeFolder: "Bỏ chọn thư mục",
    defaultLabel: "Mặc định",
    selectedLabel: "Đã chọn",
    clearCache: "Dọn file tạm (cache)",
    appSection: "Ứng dụng",
    rateApp: "Đánh giá ứng dụng",
    shareWithFriends: "Chia sẻ với bạn bè",
    privacyPolicy: "Chính sách Quyền riêng tư",
    termsOfUse: "Điều khoản Sử dụng",
    website: "Website",
    about: "Giới thiệu",
    versionPrefix: "v",

    howtoTitle: "Cách sao chép liên kết",
    step1Title: "Mở video trên TikTok",
    step1Desc: "Vào ứng dụng TikTok và mở video bạn muốn tải.",
    step2Title: "Nhấn Chia sẻ → Sao chép liên kết",
    step2Desc: "Dùng nút Chia sẻ và chọn Sao chép liên kết để lấy URL.",
    step3Title: "Dán vào VidDown",
    step3Desc: "Dán link vào ô nhập phía trên rồi nhấn Tải xuống.",
  },
  fr: {
    yourUltimate: "Votre",
    downloader: "Téléchargeur",
    heroDesc:
      "VidDown vous permet de télécharger des vidéos instantanément, rapidement et facilement.",
    placeholder: "collez votre lien vidéo ici...",
    download: "Télécharger",
    pleaseWait: "Veuillez patienter…",
    supported: "Plateformes prises en charge :",
    mp4: "MP4 (sans logo)",
    mp3: "MP3 (audio)",
    open: "Ouvrir",
    save: "Enregistrer",
    tagline: "Téléchargeur de vidéos",
    missingLink: "Lien manquant",
    pasteFirst: "Collez d'abord un lien TikTok !",
    apiMissing: "API manquante",
    cfgApi: "API_BASE_URL du backend n’est pas configuré.",
    invalidLink: "Lien invalide",
    onlyTiktok: "L’API prend actuellement en charge TikTok uniquement.",
    fetchErr: "Impossible d’obtenir les informations.",
    savedAndroid:
      "Le fichier a été enregistré dans le dossier choisi / ou partagé.",
    savedIOS:
      "Ouvrez la feuille de partage pour enregistrer dans Fichiers/Photos.",
    ok: "OK",
    chooseLang: "Choisir la langue",
    english: "English",
    vietnamese: "Tiếng Việt",
    french: "Français",
    indonesian: "Bahasa Indonesia",
    cancel: "Annuler",

    quickActions: "Actions rapides",
    chooseFolder: "Choisir le dossier de téléchargement (Android)",
    removeFolder: "Supprimer le dossier choisi",
    defaultLabel: "Par défaut",
    selectedLabel: "Sélectionné",
    clearCache: "Vider le cache",
    appSection: "Application",
    rateApp: "Noter l’app",
    shareWithFriends: "Partager avec des amis",
    privacyPolicy: "Politique de confidentialité",
    termsOfUse: "Conditions d’utilisation",
    website: "Site web",
    about: "À propos",
    versionPrefix: "v",

    howtoTitle: "Comment copier le lien",
    step1Title: "Ouvrez la vidéo sur TikTok",
    step1Desc: "Allez dans l’app TikTok et ouvrez la vidéo à télécharger.",
    step2Title: "Touchez Partager → Copier le lien",
    step2Desc:
      "Utilisez le bouton Partager puis Copier le lien pour obtenir l’URL.",
    step3Title: "Collez dans VidDown",
    step3Desc: "Collez le lien ci-dessus et touchez Télécharger.",
  },
  id: {
    yourUltimate: "Alat",
    downloader: "Unduh",
    heroDesc: "VidDown memudahkan Anda mengunduh video dengan cepat dan mudah.",
    placeholder: "tempel tautan video di sini...",
    download: "Unduh",
    pleaseWait: "Tunggu sebentar…",
    supported: "Platform yang didukung:",
    mp4: "MP4 (tanpa logo)",
    mp3: "MP3 (audio)",
    open: "Buka",
    save: "Simpan",
    tagline: "Pengunduh Video",
    missingLink: "Tautan kosong",
    pasteFirst: "Tempel tautan TikTok terlebih dahulu!",
    apiMissing: "API kosong",
    cfgApi: "API_BASE_URL backend belum dikonfigurasi.",
    invalidLink: "Tautan tidak valid",
    onlyTiktok: "Saat ini API hanya mendukung TikTok.",
    fetchErr: "Gagal mengambil informasi.",
    savedAndroid: "File tersimpan ke folder pilihan Anda / atau dibagikan.",
    savedIOS: "Buka Share Sheet untuk menyimpan ke Files/Photos.",
    ok: "OK",
    chooseLang: "Pilih bahasa",
    english: "English",
    vietnamese: "Tiếng Việt",
    french: "Français",
    indonesian: "Bahasa Indonesia",
    cancel: "Batal",

    quickActions: "Aksi cepat",
    chooseFolder: "Pilih folder unduhan (Android)",
    removeFolder: "Hapus folder terpilih",
    defaultLabel: "Default",
    selectedLabel: "Terpilih",
    clearCache: "Bersihkan cache",
    appSection: "Aplikasi",
    rateApp: "Nilai aplikasi",
    shareWithFriends: "Bagikan ke teman",
    privacyPolicy: "Kebijakan Privasi",
    termsOfUse: "Syarat Penggunaan",
    website: "Situs web",
    about: "Tentang",
    versionPrefix: "v",

    howtoTitle: "Cara menyalin tautan",
    step1Title: "Buka video di TikTok",
    step1Desc: "Masuk ke aplikasi TikTok dan buka video yang ingin diunduh.",
    step2Title: "Ketuk Bagikan → Salin tautan",
    step2Desc:
      "Gunakan tombol Bagikan lalu pilih Salin tautan untuk mendapatkan URL.",
    step3Title: "Tempel ke VidDown",
    step3Desc: "Tempel tautan ke kotak di atas lalu ketuk Unduh.",
  },
};

function guessDeviceLang(): LangCode {
  try {
    const loc = (
      Intl.DateTimeFormat().resolvedOptions().locale || "en"
    ).toLowerCase();
    if (loc.startsWith("vi")) return "vi";
    if (loc.startsWith("fr")) return "fr";
    if (loc.startsWith("id")) return "id";
  } catch {}
  return "en";
}

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (k: string) => string;
};

const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "vi" || saved === "fr" || saved === "id")
        setLangState(saved);
      else setLangState(guessDeviceLang());
    })();
  }, []);

  const setLang = async (l: LangCode) => {
    setLangState(l);
    await AsyncStorage.setItem(LANG_KEY, l);
  };

  const t = (k: string) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider/>");
  return ctx;
}
