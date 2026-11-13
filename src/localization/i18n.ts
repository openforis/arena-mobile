import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { LanguageConstants } from "model/LanguageSettings";
import { SettingsService } from "service/settingsService";
import { SystemUtils } from "utils/SystemUtils";

import en from "./en";

export { useTranslation } from "react-i18next";

type LanguageBundle = Record<string, Record<string, any>>;

// static requires (Metro can't resolve computed paths), evaluated only when the language is used
const bundleLoaders: Record<string, () => LanguageBundle> = {
  de: () => require("./de").default,
  en: () => en,
  es: () => require("./es").default,
  fa: () => require("./fa").default,
  fi: () => require("./fi").default,
  fr: () => require("./fr").default,
  id: () => require("./id").default,
  ja: () => require("./ja").default,
  pt: () => require("./pt").default,
  ru: () => require("./ru").default,
  sr: () => require("./sr").default,
};
const supportedLngs = Object.keys(bundleLoaders);
const fallbackLng = "en";
const sysLng = SystemUtils.getLanguageCode();

const toSupportedLanguage = (lang: any) =>
  supportedLngs.includes(lang) ? lang : fallbackLng;

const systemLanguageOrDefault = toSupportedLanguage(sysLng);

const toFinalSuppotedLang = (lang: any) =>
  lang === LanguageConstants.system
    ? systemLanguageOrDefault
    : toSupportedLanguage(lang);

const loadedLngs = new Set<string>([fallbackLng]);

const ensureLanguageLoaded = (lang: string) => {
  if (loadedLngs.has(lang)) return;
  const bundle = bundleLoaders[lang]?.();
  if (!bundle) return;
  for (const [ns, resources] of Object.entries(bundle)) {
    i18n.addResourceBundle(lang, ns, resources, true, true);
  }
  loadedLngs.add(lang);
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (callback: any) => {
    const onDetected = (lang: string) => {
      ensureLanguageLoaded(lang);
      callback(lang);
    };
    SettingsService.fetchSettings()
      .then((settings) => {
        const { language: langInSettings } = settings;
        onDetected(toFinalSuppotedLang(langInSettings));
      })
      .catch(() => {
        onDetected(systemLanguageOrDefault);
      });
  },
} as any;

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: "v3", // to make it work for Android devices
    resources: { en },
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    supportedLngs,
  } as any);

const changeLanguage = (lang: any) => {
  const supportedLang = toFinalSuppotedLang(lang);
  ensureLanguageLoaded(supportedLang);
  i18n.changeLanguage(supportedLang);
};

export { changeLanguage, i18n };
