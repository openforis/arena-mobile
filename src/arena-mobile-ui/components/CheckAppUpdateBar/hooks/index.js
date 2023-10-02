import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState, useCallback} from 'react';
import VersionCheck from 'react-native-version-check';

export const useGetAppHasUpdateAvailable = ({forceUpdate = false}) => {
  const [updateAvailable, setUpdateAvailable] = useState({isNeeded: false});

  const checkVersion = useCallback(async () => {
    try {
      const netState = await NetInfo.fetch();
      if (netState.isConnected === false) {
        return;
      }
      const _updateAvailable = await VersionCheck.needUpdate({forceUpdate});
      setUpdateAvailable(_updateAvailable);
    } catch (error) {
      console.log('useGetAppHasUpdateAvailable:checkVersion:error', {error});
    }
  }, [forceUpdate]);

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  return updateAvailable;
};
