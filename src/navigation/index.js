import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES, SCREENS, KEYS} from './constants';

const Stack = createNativeStackNavigator();

function Arena() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}

export default Arena;
