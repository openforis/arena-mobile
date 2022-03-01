import {combineReducers} from 'redux';
import accessData from './accessData';
import ui from './ui';
import preferences from './preferences';

export default combineReducers({
  accessData,
  ui,
  preferences,
});
