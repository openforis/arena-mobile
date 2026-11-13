import { useCallback, useMemo } from "react";

import { useTranslation as useI18nTranslation } from "./i18n";

export { changeLanguage, i18n } from "./i18n";

export {
  TextDirection,
  useIsTextDirectionRtl,
  useTextDirection,
} from "./useTextDirection";

export type TranslateFunction = (key?: string | null, params?: any) => string;

const useTranslation = () => {
  const { t: i18nT } = useI18nTranslation();
  // stable reference: hooks depending on t must not re-run on every render
  const t: TranslateFunction = useCallback(
    (key, params) =>
      (key?.length ?? 0) > 0 ? (i18nT(key!, params) as string) : "",
    [i18nT],
  );
  return useMemo(() => ({ t }), [t]);
};

export { useTranslation };
