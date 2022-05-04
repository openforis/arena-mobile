import {combineReducers} from 'redux';

import {reducer as app} from './app';
import {reducer as nodes} from './nodes';
import {reducer as records} from './records';
import {reducer as survey} from './survey';
import {reducer as surveys} from './surveys';
import {reducer as user} from './user';

const appReducers = combineReducers({
  app,
  records,
  nodes,
  survey,
  surveys,
  user,
});

export default appReducers;
