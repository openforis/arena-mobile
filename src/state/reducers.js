import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import FilesystemStorage from 'redux-persist-filesystem-storage';

import {reducer as app} from './app';
import {reducer as files} from './files';
import {reducer as form} from './form';
import {reducer as nodes} from './nodes';
import {reducer as records} from './records';
import {reducer as survey} from './survey';
import {reducer as surveys} from './surveys';
import {reducer as user} from './user';

const getConfig = key => ({
  key: `${key}-store`,
  storage: FilesystemStorage,
  stateReconciler: hardSet,
  throttle: 500,
});

const appReducers = combineReducers({
  app: persistReducer(getConfig('app'), app),
  records: persistReducer(getConfig('records'), records),
  nodes: persistReducer(getConfig('nodes'), nodes),
  survey: persistReducer(getConfig('survey'), survey),
  surveys: persistReducer(getConfig('surveys'), surveys),
  user: persistReducer(getConfig('user'), user),
  form: persistReducer(getConfig('form'), form),
  files: persistReducer(getConfig('files'), files),
});

export default appReducers;
