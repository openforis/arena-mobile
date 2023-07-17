import {useState, useCallback, useEffect} from 'react';
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
        alert({
          title: t('Form:nodeDefCoordinate.permissions.unable_settings'),
        });
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      alert({title: t('Form:nodeDefCoordinate.permissions.denied')});
    }

    if (status === 'disabled') {
      alert({
        title: t('Form:nodeDefCoordinate.permissions.turn_on.message', {
          appName: appConfig.displayName,
        }),
        message: '',
        acceptText: t('Form:nodeDefCoordinate.permissions.turn_on.accept'),
        onAccept: openSetting,
        dismissText: t('Form:nodeDefCoordinate.permissions.turn_on.reject'),
        onDismiss: () => null,
      });
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

  const _setLocation = useCallback(
    position => {
      setLocation(prevPosition => {
        if (
          prevPosition?.coords?.accuracy &&
          position?.coords?.accuracy &&
          prevPosition?.coords?.accuracy < position?.coords?.accuracy
        ) {
          return prevPosition;
        }

        return position;
      });
    },
    [setLocation],
  );

  const getLocationOriginal = useCallback(async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        _setLocation(position);
      },
      error => {
        alert({title: `Code ${error.code}`, message: error.message});
        _setLocation(null);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 50,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
      },
    );
  }, [hasLocationPermission, _setLocation]);

  const _getLocation = useCallback(async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    const watcherId = Geolocation.watchPosition(
      position => {
        _setLocation(position);
      },
      error => {
        alert({title: `Code ${error.code}`, message: error.message});
        _setLocation(null);
      },
      {
        interval: 100,
        fastestInterval: 100,
        distanceFilter: 0,
        enableHighAccuracy: true,
        accuracy: {
          ios: 'best',
          android: 'high',
        },

        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      },
    );

    return watcherId;
  }, [hasLocationPermission, _setLocation]);

  const getLocation = useCallback(() => {
    const watcherId = _getLocation();

    setTimeout(() => {
      Geolocation.clearWatch(watcherId);
    }, 120000);
  }, [_getLocation]);

  useEffect(() => {
    return () => {
      Geolocation.stopObserving();
    };
  }, []);

  useEffect(() => {
    return () => {
      setLocation(false);
    };
  }, []);

  return {getLocation, location};
};

export default useGetLocation;
