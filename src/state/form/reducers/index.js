import {combineReducers} from 'redux';

import data from './data';
import ui from './ui';
import validation from './validation';

export default combineReducers({
  data,
  ui,
  validation,
});
