import {combineReducers} from 'redux';

import data from './data';
import remoteRecordsSummary from './remoteRecordsSummary';
import ui from './ui';

export default combineReducers({
  data,
  ui,
  remoteRecordsSummary,
});
