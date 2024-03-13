import {createStore, applyMiddleware} from 'redux';
import {persistStore} from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import {alert} from 'arena-mobile-ui/utils';

import {ROUTES} from '../navigation/constants';

import * as navigator from './navigatorService';
import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleWare = createSagaMiddleware({
  onError: (error, errorInfo) => {
    setImmediate(() => {
      alert({
        title: 'Oops! something wrong happened',
        message: `
          Please share it with the Arena team. \n
          ${error.toString()}
          ${error.stack}
          ${JSON.stringify(errorInfo, null, 2)} 
        `,
        acceptText: 'Ok',
        onAccept: () => {
          navigator.reset(ROUTES.HOME);
        },
      });
    });
  },
});

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
