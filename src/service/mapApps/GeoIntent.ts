import { requireOptionalNativeModule } from "expo";

// JS interface of the native module in modules/geo-intent (Android only)

type GeoIntentNativeModule = {
  getHandlerPackages(uri: string): string[];
  open(uri: string, packageName: string | null): void;
};

const nativeModule =
  requireOptionalNativeModule<GeoIntentNativeModule>("GeoIntent");

// false on iOS, in Expo Go or in builds made before the native module was added
const isAvailable = (): boolean => !!nativeModule;

const getNativeModule = (): GeoIntentNativeModule => {
  if (!nativeModule) {
    throw new Error("GeoIntent native module not available");
  }
  return nativeModule;
};

export const GeoIntent = {
  isAvailable,
  getHandlerPackages: (uri: string) =>
    getNativeModule().getHandlerPackages(uri),
  open: (uri: string, packageName?: string) =>
    getNativeModule().open(uri, packageName ?? null),
};
