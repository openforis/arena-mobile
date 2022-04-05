import ConnectionSettings from 'screens/ConnectionSettings';
import Home from 'screens/Home';
import Survey from 'screens/Survey';
import Surveys from 'screens/Surveys';

import {KEYS} from '../constants';

export const SCREENS = {
  [KEYS.HOME]: {component: Home},
  [KEYS.CONNECTION_SETTINGS]: {
    component: ConnectionSettings,
  },
  [KEYS.SURVEY]: {component: Survey},
  [KEYS.SURVEYS]: {
    component: Surveys,
  },
};
