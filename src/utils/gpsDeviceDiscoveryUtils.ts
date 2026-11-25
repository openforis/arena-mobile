import type { DiscoveredGpsDevice } from "service/externalGps/types";

/**
 * Merges a newly discovered device into the existing list, deduping by address
 * (defensive: the native module isn't documented to refire the same device within a
 * scan, but a stale row is worse than a redundant check) and keeping
 * recognized-vendor devices ahead of unrecognized ones so the common case (a real GPS
 * receiver) doesn't get buried under nearby headphones/printers/etc.
 */
export const mergeDiscoveredDevice = (
  devices: DiscoveredGpsDevice[],
  device: DiscoveredGpsDevice,
): DiscoveredGpsDevice[] => {
  const withoutDuplicate = devices.filter(
    (item) => item.address !== device.address,
  );
  const merged = [...withoutDuplicate, device];
  const recognized = merged.filter((item) => !!item.vendor);
  const unrecognized = merged.filter((item) => !item.vendor);
  return [...recognized, ...unrecognized];
};
