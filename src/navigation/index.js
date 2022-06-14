import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useRef, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Provider} from 'react-redux';

Ionicons.loadFont();
MaterialCommunityIcons.loadFont();

import 'i18n';

import {setNavigator} from 'state/navigatorService';
import getStore from 'state/store';

import {ROUTES, KEYS} from './constants';
import {SCREENS} from './screens';

const Stack = createNativeStackNavigator();
const {store} = getStore();

export const _store = store;

function Arena() {
  const navigationRef = useRef(null);

  useEffect(() => {
    setNavigator(navigationRef);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Provider store={store}>
        <Stack.Navigator
          initialRouteName={ROUTES[KEYS.HOME]}
          screenOptions={{
            headerShown: false,
          }}>
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
  );
}

export default Arena;
