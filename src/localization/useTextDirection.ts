import { i18n } from "./i18n";

export const textDirections = {
  rtl: "rtl",
  ltr: "ltr",
};

const isRtlByLang = {
  fa: true,
};

const getLanguageTextDirection = (lang: any) => {
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const isRtl = !!isRtlByLang[lang];
  return isRtl ? textDirections.rtl : textDirections.ltr;
};

export const useTextDirection = () => {
  const lang = i18n.language;
  const textDirection = getLanguageTextDirection(lang);
  return textDirection;
};

export const useIsTextDirectionRtl = () => {
  const textDirection = useTextDirection();
  return textDirection === textDirections.rtl;
};
