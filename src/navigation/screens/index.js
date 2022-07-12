import ConnectionSettings from 'screens/ConnectionSettings';
import Form from 'screens/Form';
import Home from 'screens/Home';
import Records from 'screens/Records';
import Survey from 'screens/Survey';
import Surveys from 'screens/Surveys';

import {KEYS} from '../constants';

export const SCREENS = {
  [KEYS.HOME]: {component: Home, options: {gestureEnabled: false}},
  [KEYS.CONNECTION_SETTINGS]: {
    component: ConnectionSettings,
    options: {gestureEnabled: false},
  },
  [KEYS.SURVEY]: {component: Survey, options: {gestureEnabled: false}},
  [KEYS.SURVEYS]: {
    component: Surveys,
    options: {gestureEnabled: false},
  },
  [KEYS.RECORDS]: {
    component: Records,
    options: {gestureEnabled: false},
  },
  [KEYS.FORM]: {
    component: Form,
    options: {gestureEnabled: false},
  },
};
