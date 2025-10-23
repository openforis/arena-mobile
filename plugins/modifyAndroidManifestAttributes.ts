const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androidManifestPlugin(config, data) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    Object.entries(data || {}).forEach(([category, categoryData]) => {
      const manifestCategoryItems = androidManifest[category] || [];
      if (manifestCategoryItems.length > 0) {
        Object.entries(categoryData || {}).forEach(
          ([attribute, attributeValue]) => {
            manifestCategoryItems[0].$[attribute] = attributeValue;
          }
        );
      }
    });
    return config;
  });
};
