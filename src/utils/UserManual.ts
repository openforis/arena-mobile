// published by the User manual workflow as assets of every release (see docs/user-manual/README.md)
const userManualLanguages = new Set(["en", "fr", "es"]);
const defaultLanguage = "en";
const releasesUrl = "https://github.com/openforis/arena-mobile/releases";

type GetUrlParams = {
  lang?: string | null;
  // app version: manual of that release (tag v<version>); latest release if not specified
  version?: string | null;
};

const getUrl = ({ lang, version }: GetUrlParams = {}): string => {
  const langCode = lang?.split("-")[0];
  const manualLang =
    langCode && userManualLanguages.has(langCode) ? langCode : defaultLanguage;
  const downloadUrl = version
    ? `${releasesUrl}/download/v${version}`
    : `${releasesUrl}/latest/download`;
  return `${downloadUrl}/arena-mobile-user-manual-${manualLang}.pdf`;
};

export const UserManual = {
  getUrl,
};
