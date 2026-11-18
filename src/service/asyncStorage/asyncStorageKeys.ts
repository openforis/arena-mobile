export const asyncStorageKeys = {
  loggedInUser: "@loggedInUser",
  offlineMapAreas: "@offlineMapAreas",
  preferences: "@preferences",
  settings: "@settings",
} as const;

export type AsyncStorageKey =
  (typeof asyncStorageKeys)[keyof typeof asyncStorageKeys];
