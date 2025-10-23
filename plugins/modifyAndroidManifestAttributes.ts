// @ts-expect-error TS(1208): 'modifyAndroidManifestAttributes.ts' cannot be com... Remove this comment to see the full error message
const { withAndroidManifest } = require("@expo/config-plugins");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function androidManifestPlugin(config: any, data: any) {
  return withAndroidManifest(config, async (config: any) => {
    const androidManifest = config.modResults.manifest;
    Object.entries(data || {}).forEach(([category, categoryData]) => {
      const manifestCategoryItems = androidManifest[category] || [];
      if (manifestCategoryItems.length > 0) {
        // @ts-expect-error TS(2769): No overload matches this call.
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
