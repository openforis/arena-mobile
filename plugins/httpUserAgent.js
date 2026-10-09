const { withMainApplication } = require("@expo/config-plugins");

// tile servers like OpenStreetMap block the generic Java User-Agent ("Dalvik/...") used by
// the map tile overlays: the default User-Agent of HttpURLConnection is set to identify the app
const marker = 'System.setProperty("http.agent"';

// same product token used by the offline map tiles download (OfflineMapAreaDownloadJob)
const buildUserAgent = (config) =>
  `OpenForisArenaMobile/${config.version} (+https://www.openforis.org)`;

const addUserAgent = ({ contents, language, userAgent }) => {
  if (contents.includes(marker)) return contents;
  const statement =
    language === "java"
      ? `${marker}, "${userAgent}");`
      : `${marker}, "${userAgent}")`;
  const superOnCreate = /super\.onCreate\(\)(;)?/;
  if (!superOnCreate.test(contents)) {
    throw new Error(
      "httpUserAgent plugin: super.onCreate() not found in MainApplication",
    );
  }
  return contents.replace(
    superOnCreate,
    (match) => `${match}\n    ${statement}`,
  );
};

module.exports = function httpUserAgentPlugin(config) {
  return withMainApplication(config, (config) => {
    const { modResults } = config;
    modResults.contents = addUserAgent({
      contents: modResults.contents,
      language: modResults.language,
      userAgent: buildUserAgent(config),
    });
    return config;
  });
};
