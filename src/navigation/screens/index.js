import ConnectionSettings from 'screens/ConnectionSettings';
import Form from 'screens/Form';
import Home from 'screens/Home';
import Records from 'screens/Records';
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
  [KEYS.RECORDS]: {
    component: Records,
  },
  [KEYS.FORM]: {
    component: Form,
  },
};
