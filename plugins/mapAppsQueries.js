const { withAndroidManifest, withInfoPlist } = require("@expo/config-plugins");

const supportedMapApps = require("../src/service/mapApps/supportedMapApps.json");

const getSchemeOfIntent = (intent) =>
  intent.data?.[0]?.$?.["android:scheme"] ?? intent.data?.$?.["android:scheme"];

module.exports = function mapAppsQueriesPlugin(config) {
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    manifest.queries = manifest.queries ?? [{}];
    const queries = manifest.queries[0];
    const intents = queries.intent ?? [];
    supportedMapApps.androidQuerySchemes.forEach((scheme) => {
      if (!intents.some((intent) => getSchemeOfIntent(intent) === scheme)) {
        intents.push({
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": scheme } }],
        });
      }
    });
    queries.intent = intents;
    return config;
  });

  return withInfoPlist(config, (config) => {
    const schemes = config.modResults.LSApplicationQueriesSchemes ?? [];
    supportedMapApps.iosQuerySchemes.forEach((scheme) => {
      if (!schemes.includes(scheme)) schemes.push(scheme);
    });
    config.modResults.LSApplicationQueriesSchemes = schemes;
    return config;
  });
};
