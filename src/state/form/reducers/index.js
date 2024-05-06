import {combineReducers} from 'redux';

import data from './data';
import preferences from './preferences';
import ui from './ui';

export default combineReducers({
  data,
  ui,

  preferences,
});
