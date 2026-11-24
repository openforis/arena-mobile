import { Languages, LanguagesISO639part2 } from "@openforis/arena-core";

type LanguageLabelsMap = Record<string, Record<string, string> | undefined>;

const getLanguageLabel = (
  langCode: string | null | undefined,
): string | null => {
  if (!langCode) return null;
  const languageMap: LanguageLabelsMap =
    langCode.length === 2 ? Languages : LanguagesISO639part2;
  const item = languageMap?.[langCode];
  return item?.["en"] ?? langCode;
};

export const LanguageUtils = { getLanguageLabel };
