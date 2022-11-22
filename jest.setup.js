import {jest} from '@jest/globals';
import React from 'react';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native-safari-view', () => ({
  show: () => {},
}));
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);
jest.mock('react-native-qrcode-scanner', () => {});

React.NativeModules = {};
React.NativeModules.RNBranchEventEmitter = {};
React.NativeModules.RNBranch = {};

const NativeModules = {
  RNFirebase: {
    apps: [{name: '[DEFAULT]'}, {name: 'notifications'}, {name: 'messaging'}],
  },
  RNFirebaseAnalytics: {
    setUserId: jest.fn(),
  },
  RNFirebaseMessaging: {
    jsInitialised: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve('FIREBASE_TOKEN')),
  },
  RNFirebaseNotifications: {
    jsInitialised: jest.fn(() => Promise.resolve()),
    getInitialNotification: jest.fn(() => Promise.resolve()),
  },
  RNFSManager: {
    RNFSMainBundlePath: 'main-bundle',
    RNFSCachesDirectoryPath: 'caches',
    RNFSDocumentDirectoryPath: 'documents',
    RNFSExternalDirectoryPath: 'external',
    RNFSExternalStorageDirectoryPath: 'external-storage',
    RNFSTemporaryDirectoryPath: 'tmp',
    RNFSLibraryDirectoryPath: 'library',
    RNFSFileTypeRegular: 'file-type-regular',
    RNFSFileTypeDirectory: 'file-type-directory',
  },
  RNShare: {},
  OurLocation: {
    getLocation: jest
      .fn()
      .mockResolvedValue({coords: {latitude: 55, longitude: 37}}),
    requestAuthorization: jest.fn(() => Promise.resolve()),
  },
  OurNavigator: {
    present: jest.fn(() => Promise.resolve()),
    dismiss: jest.fn(() => Promise.resolve()),
    push: jest.fn(() => Promise.resolve()),
    pop: jest.fn(() => Promise.resolve()),
  },
};

Object.keys(NativeModules).forEach(name => {
  mockReactNativeModule(name, NativeModules[name]);
});

function mockReactNativeModule(name, shape) {
  jest.doMock(name, () => shape, {virtual: true});
  require('react-native').NativeModules[name] = shape;
}
