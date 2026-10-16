const { withAppBuildGradle } = require("@expo/config-plugins");

// embeds native debug symbols in the release AAB so Play Console can symbolicate native crashes/ANRs
const marker = "debugSymbolLevel";

const addDebugSymbolLevel = (contents) => {
  if (contents.includes(marker)) return contents;
  const releaseBuildType = /buildTypes\s*\{[\s\S]*?release\s*\{/;
  if (!releaseBuildType.test(contents)) {
    throw new Error(
      "androidNativeDebugSymbols plugin: release build type not found in app/build.gradle",
    );
  }
  return contents.replace(
    releaseBuildType,
    (match) => `${match}\n            ndk { ${marker} 'SYMBOL_TABLE' }`,
  );
};

module.exports = function androidNativeDebugSymbolsPlugin(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = addDebugSymbolLevel(
      config.modResults.contents,
    );
    return config;
  });
};
