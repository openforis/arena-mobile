import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Platform,
  Linking,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import {alert} from 'arena-mobile-ui/utils';

import appConfig from '../../../../../app.json';

const useGetLocation = () => {
  const {t} = useTranslation();
  const [location, setLocation] = useState(null);
  const hasPermissionIOS = useCallback(async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        alert(t('Form:nodeDefCoordinate.permissions.unable_settings'));
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      alert(t('Form:nodeDefCoordinate.permissions.denied'));
    }

    if (status === 'disabled') {
      alert(
        t('Form:nodeDefCoordinate.permissions.turn_on.message', {
          appName: appConfig.displayName,
        }),
        '',
        [
          {
            text: t('Form:nodeDefCoordinate.permissions.turn_on.accept'),
            onPress: openSetting,
          },
          {
            text: t('Form:nodeDefCoordinate.permissions.turn_on.reject'),
            onPress: null,
          },
        ],
      );
    }

    return false;
  }, [t]);

  const hasLocationPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      return hasPermissionIOS();
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasAndroidPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasAndroidPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        t('Form:nodeDefCoordinate.permissions.toast.denied'),
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        t('Form:nodeDefCoordinate.permissions.toast.revoked'),
        ToastAndroid.LONG,
      );
    }

    return false;
  }, [hasPermissionIOS, t]);

  const getLocation = useCallback(async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position);
      },
      error => {
        alert(`Code ${error.code}`, error.message);
        setLocation(null);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
      },
    );
  }, [hasLocationPermission]);

  return {getLocation, location};
};

export default useGetLocation;
