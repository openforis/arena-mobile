const config = {};

export function setDeviceInfo(deviceInfo) {
  if (deviceInfo) {
    config.deviceInfo = deviceInfo;
  }
}
export const getDeviceInfo = () => {
  const deviceInfo = config?.deviceInfo;
  return deviceInfo;
};
