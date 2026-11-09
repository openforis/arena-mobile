// published by the User manual workflow as assets of every release (see docs/user-manual/README.md)
const userManualLanguages = new Set(["en", "fr", "es"]);
const defaultLanguage = "en";
const latestReleaseDownloadUrl =
  "https://github.com/openforis/arena-mobile/releases/latest/download";

const getUrl = (lang?: string | null): string => {
  const langCode = lang?.split("-")[0];
  const manualLang =
    langCode && userManualLanguages.has(langCode) ? langCode : defaultLanguage;
  return `${latestReleaseDownloadUrl}/arena-mobile-user-manual-${manualLang}.pdf`;
};

export const UserManual = {
  getUrl,
};
