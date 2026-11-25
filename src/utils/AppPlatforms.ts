import type { ArenaAppInfo } from "@openforis/arena-core";

export type AppPlatform = NonNullable<ArenaAppInfo["platform"]>;

const fromPlatformOS = (platformOS: string): AppPlatform => {
  if (platformOS === "android") return "android";
  // web preview
  if (platformOS === "web") return "web";
  return "ios";
};

export const AppPlatforms = {
  fromPlatformOS,
};
