import * as Location from "expo-location";

const requestLocationForegroundPermission = async () => {
  const providerStatus = await Location.getProviderStatusAsync();
  if (!providerStatus.locationServicesEnabled) {
    return false;
  }
  const currentStatus = await Location.getForegroundPermissionsAsync();
  if (currentStatus.granted) {
    return true;
  }
  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();
  return foregroundPermission.granted;
};

export const Permissions = {
  requestLocationForegroundPermission,
};
