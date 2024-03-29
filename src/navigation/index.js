import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import {enableScreens} from 'react-native-screens';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Provider} from 'react-redux';
enableScreens();
MaterialCommunityIcons.loadFont();

import 'i18n';

import {setNavigator} from 'state/navigatorService';
import {setDeviceInfo} from 'state/deviceInfoService';
import getStore from 'state/store';

import {ROUTES, KEYS} from './constants';
import {SCREENS} from './screens';
import DeviceInfo from 'react-native-device-info';

const Stack = createNativeStackNavigator();
const {store, persistor: _persistor} = getStore();

export const persistor = _persistor;

function Arena() {
  const navigationRef = React.useRef(null);
  const deviceInfo = React.useRef(null);

  React.useEffect(() => {
    setNavigator(navigationRef);
  }, []);

  React.useEffect(() => {
    setDeviceInfo(DeviceInfo);
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Provider store={store}>
          <Stack.Navigator
            headerMode="none"
            initialRouteName={ROUTES[KEYS.HOME]}
            screenOptions={{
              headerShown: false,
            }}
            options={{gestureEnabled: false}}>
            {Object.keys(KEYS).map(navigationKey => (
              <Stack.Screen
                key={navigationKey}
                name={ROUTES[navigationKey]}
                component={SCREENS[navigationKey].component}
                options={SCREENS[navigationKey].options}
              />
            ))}
          </Stack.Navigator>
        </Provider>
      </NavigationContainer>
      <Toast />
    </>
  );
}

const ArenaWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <Arena />
    </ErrorBoundary>
  );
};

export default ArenaWithErrorBoundary;
