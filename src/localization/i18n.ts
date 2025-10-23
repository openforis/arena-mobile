import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import { LanguageConstants } from "model/LanguageSettings";
import { SettingsService } from "service/settingsService";
import { SystemUtils } from "utils/SystemUtils";

import de from "./de";
import en from "./en";
import es from "./es";
import fa from "./fa";
import fi from "./fi";
import fr from "./fr";
import id from "./id";
import pt from "./pt";
import ru from "./ru";

const resources = { de, en, es, fa, fi, fr, id, pt, ru };
const supportedLngs = Object.keys(resources);
const fallbackLng = "en";
const sysLng = SystemUtils.getLanguageCode();

const toSupportedLanguage = (lang: any) => supportedLngs.includes(lang) ? lang : fallbackLng;

const systemLanguageOrDefault = toSupportedLanguage(sysLng);

const toFinalSuppotedLang = (lang: any) => lang === LanguageConstants.system
  ? systemLanguageOrDefault
  : toSupportedLanguage(lang);

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (callback: any) => {
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

// @ts-expect-error TS(2769): No overload matches this call.
i18n
  // @ts-expect-error TS(2345): Argument of type '{ type: string; async: boolean; ... Remove this comment to see the full error message
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

const changeLanguage = (lang: any) => {
  const supportedLang = toFinalSuppotedLang(lang);
  i18n.changeLanguage(supportedLang);
};

export { changeLanguage, i18n, useTranslation };
