import * as Location from "expo-location";

const requestLocationForegroundPermission = async () => {
  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();
  const providerStatus = await Location.getProviderStatusAsync();
  return providerStatus.locationServicesEnabled && foregroundPermission.granted;
};

export const Permissions = {
  requestLocationForegroundPermission,
};
