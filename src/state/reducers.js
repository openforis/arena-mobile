import {combineReducers} from 'redux';

import {reducer as app} from './app';
import {reducer as survey} from './survey';
import {reducer as surveys} from './surveys';
import {reducer as user} from './user';

export const RESET_STATE = 'root/RESET_STATE';

const appReducers = combineReducers({
  app,
  survey,
  surveys,
  user,
});

export default (state, action) => {
  if (action.type === RESET_STATE) {
    state = undefined;
  }

  return appReducers(state, action);
};
