import { useTranslation } from "./i18n";

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

export const useTextDirection = () => {
  // from react-i18next: re-renders when the language changes
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const textDirection = getLanguageTextDirection(lang);
  return textDirection;
};

export const useIsTextDirectionRtl = () => {
  const textDirection = useTextDirection();
  return textDirection === TextDirection.rtl;
};
