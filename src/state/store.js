import {createStore, applyMiddleware} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import createSagaMiddleware from 'redux-saga';

import {storage} from 'infra/storage';

import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleWare = createSagaMiddleware();

const middlewares = [sagaMiddleWare];

// persist config
const persistConfig = {
  key: 'root-store',
  storage,
  stateReconciler: hardSet,
  throttle: 6000,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const getStore = () => {
  const store = createStore(persistedReducer, applyMiddleware(...middlewares));

  sagaMiddleWare.run(sagas);

  const persistor = persistStore(store);

  return {store, persistor};
};

export default getStore;
