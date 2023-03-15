import {createStore, applyMiddleware} from 'redux';
import {persistStore} from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleWare = createSagaMiddleware();

const middlewares = [sagaMiddleWare];
const getStore = () => {
  const store = createStore(reducers, applyMiddleware(...middlewares));

  sagaMiddleWare.run(sagas);

  const persistor = persistStore(store, {
    throttle: 5000,
    debug: true,
  });

  return {store, persistor};
};

export default getStore;
