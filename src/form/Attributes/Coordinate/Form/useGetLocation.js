import {useState, useCallback} from 'react';
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
  const [location, setLocation] = useState(null);
  const [forceLocation, setForceLocation] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [locationDialog, setLocationDialog] = useState(true);
  const [useLocationManager, setUseLocationManager] = useState(false);

  const hasPermissionIOS = useCallback(async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      alert('Location permission denied');
    }

    if (status === 'disabled') {
      alert(
        `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
        '',
        [
          {text: 'Go to Settings', onPress: openSetting},
          {text: "Don't Use Location", onPress: null},
        ],
      );
    }

    return false;
  }, []);

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
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  }, [hasPermissionIOS]);

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
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: forceLocation,
        forceLocationManager: useLocationManager,
        showLocationDialog: locationDialog,
      },
    );
  }, [
    forceLocation,
    hasLocationPermission,
    highAccuracy,
    useLocationManager,
    locationDialog,
  ]);

  return {getLocation, location};
};

export default useGetLocation;
