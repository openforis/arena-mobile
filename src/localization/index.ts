import {
  changeLanguage,
  i18n,
  useTranslation as useI18nTranslation,
} from "./i18n";
import {
  TextDirection,
  useIsTextDirectionRtl,
  useTextDirection,
} from "./useTextDirection";

const useTranslation = () => {
  const { t } = useI18nTranslation();
  return {
    t: (key?: string, params?: any) =>
      (key?.length ?? 0) > 0 ? (t(key!, params) as string) : "",
  };
};

export {
  changeLanguage,
  i18n,
  TextDirection as textDirections,
  useIsTextDirectionRtl,
  useTextDirection,
  useTranslation,
};
