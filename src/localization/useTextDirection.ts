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

export const useTextDirection = () => {
  const lang = i18n.language;
  const textDirection = getLanguageTextDirection(lang);
  return textDirection;
};

export const useIsTextDirectionRtl = () => {
  const textDirection = useTextDirection();
  return textDirection === TextDirection.rtl;
};
