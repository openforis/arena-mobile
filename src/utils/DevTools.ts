// developer tools (e.g. benchmarks): in development builds, or in builds made with EXPO_PUBLIC_DEV_TOOLS=true
const enabled = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === "true";

export const DevTools = {
  enabled,
};
