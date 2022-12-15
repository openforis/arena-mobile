import {useState, useEffect} from 'react';
import DeviceInfo from 'react-native-device-info';

import * as fs from 'infra/fs';

const convertBytes = numBytes => {
  const kB = numBytes / 1000;
  if (kB < 1000) {
    return `${kB.toFixed(2)} kB`;
  }
  const MB = numBytes / (1000 * 1000);
  if (MB < 1000) {
    return `${MB.toFixed(2)} MB`;
  }
  const GB = numBytes / (1000 * 1000 * 1000);
  return `${GB.toFixed(2)} GB`;
};

export const useDeviceUse = () => {
  const [deviceUse, setDeviceUse] = useState({});

  const load = async () => {
    let used = 0;
    try {
      const dirItems = await fs.readDir({dirPath: '.'});
      used = dirItems.reduce((acc, dirItem) => acc + dirItem.size, 0);
    } catch (e) {
      console.log('error', e);
    }

    const data = {
      version: DeviceInfo.getReadableVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      disk: {
        free: convertBytes(DeviceInfo.getFreeDiskStorageSync()),
        total: convertBytes(DeviceInfo.getTotalDiskCapacitySync()),
        used: convertBytes(used),
      },
      memory: {
        max: convertBytes(DeviceInfo.getMaxMemorySync()),
        total: convertBytes(DeviceInfo.getTotalMemorySync()),
        used: convertBytes(DeviceInfo.getUsedMemorySync()),
      },
    };
    setDeviceUse(data);
  };

  useEffect(() => {
    load();
  }, []);

  return deviceUse;
};
