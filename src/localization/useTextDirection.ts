import { useSyncExternalStore } from "react";

import { i18n } from "./i18n";

export enum TextDirection {
  rtl = "rtl",
  ltr = "ltr",
}

const isRtlByLang: Record<string, boolean> = {
  fa: true,
};

const getLanguageTextDirection = (lang: string) => {
  const isRtl = !!isRtlByLang[lang];
  return isRtl ? TextDirection.rtl : TextDirection.ltr;
};

const subscribeToLanguageChange = (onChange: () => void) => {
  i18n.on("languageChanged", onChange);
  return () => i18n.off("languageChanged", onChange);
};

const getTextDirectionSnapshot = () => getLanguageTextDirection(i18n.language);

// lighter than react-i18next useTranslation (used by every Text): re-renders only when the direction changes
export const useTextDirection = () =>
  useSyncExternalStore(subscribeToLanguageChange, getTextDirectionSnapshot);

export const useIsTextDirectionRtl = () => {
  const textDirection = useTextDirection();
  return textDirection === TextDirection.rtl;
};
