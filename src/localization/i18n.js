import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import { LanguageConstants } from "model/LanguageSettings";
import { SettingsService } from "service/settingsService";
import { SystemUtils } from "utils/SystemUtils";

import en from "./en";
import es from "./es";
import fa from "./fa";
import pt from "./pt";
import ru from "./ru";

const resources = { en, es, fa, pt, ru };
const supportedLngs = Object.keys(resources);
const fallbackLng = "en";
const sysLng = SystemUtils.getLanguageCode();

const toSupportedLanguage = (lang) =>
  supportedLngs.includes(lang) ? lang : fallbackLng;

const systemLanguageOrDefault = toSupportedLanguage(sysLng);

const toFinalSuppotedLang = (lang) =>
  lang === LanguageConstants.system
    ? systemLanguageOrDefault
    : toSupportedLanguage(lang);

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (callback) => {
    SettingsService.fetchSettings()
      .then((settings) => {
        const { language: langInSettings } = settings;
        const targetLanguage = toFinalSuppotedLang(langInSettings);
        callback(targetLanguage);
      })
      .catch(() => {
        callback(systemLanguageOrDefault);
      });
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: "v3", // to make it work for Android devices
    resources,
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    supportedLngs,
  });

const changeLanguage = (lang) => {
  const supportedLang = toFinalSuppotedLang(lang);
  i18n.changeLanguage(supportedLang);
};

export { changeLanguage, i18n, useTranslation };
