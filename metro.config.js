// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite web (wa-sqlite) loads a wasm module
config.resolver.assetExts.push("wasm");

const webShimsDir = path.resolve(__dirname, "src/web/shims");

// native-only modules replaced on web (preview build) by the shims in src/web/shims
const webShims = {
  "@lodev09/react-native-exify": "exify.ts",
  "react-native-maps": "maps.tsx",
  "react-native-pager-view": "pagerView.tsx",
};

const tslibEsmPath = require.resolve("tslib/tslib.es6.mjs");

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    const shim = webShims[moduleName];
    if (shim) {
      return { type: "sourceFile", filePath: path.join(webShimsDir, shim) };
    }
    if (moduleName === "tslib") {
      // its "import" > "node" export condition (modules/index.js) breaks the default import interop
      return { type: "sourceFile", filePath: tslibEsmPath };
    }
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
