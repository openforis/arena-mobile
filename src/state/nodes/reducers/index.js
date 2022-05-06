import {combineReducers} from 'redux';

import data from './data';
import errors from './errors';
import ui from './ui';

export default combineReducers({
  data,
  ui,
  errors,
});
