import { useTranslation as useI18nTranslation } from "./i18n";

export { changeLanguage, i18n } from "./i18n";

export {
  TextDirection,
  useIsTextDirectionRtl,
  useTextDirection,
} from "./useTextDirection";

export type TranslateFunction = (key?: string | null, params?: any) => string;

const useTranslation = () => {
  const { t } = useI18nTranslation();
  return {
    t: (key?: string | null, params?: any): string =>
      (key?.length ?? 0) > 0 ? (t(key!, params) as string) : "",
  };
};

export { useTranslation };
