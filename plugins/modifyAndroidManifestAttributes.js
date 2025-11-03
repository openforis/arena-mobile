const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androidManifestPlugin(config, data) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const dataEntries = Object.entries(data || {});
    for (const [category, categoryData] of dataEntries) {
      const manifestCategoryItems = androidManifest[category] || [];
      if (manifestCategoryItems.length > 0) {
        const categoryDataEntries = Object.entries(categoryData || {});
        for (const [attribute, attributeValue] of categoryDataEntries) {
          manifestCategoryItems[0].$[attribute] = attributeValue;
        }
      }
    }
    return config;
  });
};
