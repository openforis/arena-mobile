import type { ArenaAppInfo } from "@openforis/arena-core";

export type AppPlatform = NonNullable<ArenaAppInfo["platform"]>;

// platforms other than Android (e.g. web preview) are reported as iOS
const fromPlatformOS = (platformOS: string): AppPlatform =>
  platformOS === "android" ? "android" : "ios";

export const AppPlatforms = {
  fromPlatformOS,
};
