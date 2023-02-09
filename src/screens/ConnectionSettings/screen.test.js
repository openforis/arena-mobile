import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import * as React from 'react';
import {render} from 'react-native-testing-library';
import {Provider} from 'react-redux';
import {act} from 'react-test-renderer';

import getStore from 'state/store';

import ConnectionSettings from './index';
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MockedMaterialCommunityIcons',
);

jest.mock('react-native-camera', () => 'react-native-camera');
jest.mock('react-native-qrcode-scanner', () => 'react-native-qrcode-scanner');
jest.mock('react-native-prompt-android', () => 'react-native-prompt-android');

// Use this instead with React Native >= 0.64
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest
      .fn()
      .mockImplementation((config, reducers) => reducers),
  };
});
const {store} = getStore();

jest.mock('react-native/Libraries/Utilities/BackHandler', () => {
  return jest.requireActual(
    'react-native/Libraries/Utilities/__mocks__/BackHandler.js',
  );
});

const _renderer = ui => {
  return render(
    <NavigationContainer>
      <Provider store={store}>{ui}</Provider>
    </NavigationContainer>,
  );
};

describe('<NavigationContainer />', () => {
  it('should match snapshot', async () => {
    const result = _renderer(<ConnectionSettings />);

    await act(async () => {
      expect(result).toMatchSnapshot();
    });
  });
});
