import { Languages, LanguagesISO639part2 } from "@openforis/arena-core";

const getLanguageLabel = (langCode) => {
  if (!langCode) return null;
  const languageMap = langCode.length === 2 ? Languages : LanguagesISO639part2;
  const item = languageMap?.[langCode];
  return item?.["en"] ?? langCode;
};

export const LanguageUtils = { getLanguageLabel };
