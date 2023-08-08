import {combineReducers} from 'redux';

import serverUrl from './serverUrl';
import settings from './settings';

export default combineReducers({
  settings,
  serverUrl,
});
