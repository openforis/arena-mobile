import {combineReducers} from 'redux';

import accessData from './accessData';
import preferences from './preferences';
import ui from './ui';

export default combineReducers({
  accessData,
  ui,
  preferences,
});
