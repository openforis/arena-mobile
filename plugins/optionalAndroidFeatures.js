const { withAndroidManifest } = require("@expo/config-plugins");

// Explicit required=false overrides features Play infers from permissions or activity orientations
module.exports = function optionalAndroidFeaturesPlugin(config, features = []) {
  return withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    const usesFeatures = manifest["uses-feature"] ?? [];
    features.forEach((name) => {
      const existing = usesFeatures.find(
        (feature) => feature.$?.["android:name"] === name,
      );
      if (existing) {
        existing.$["android:required"] = "false";
      } else {
        usesFeatures.push({
          $: { "android:name": name, "android:required": "false" },
        });
      }
    });
    manifest["uses-feature"] = usesFeatures;
    return config;
  });
};
