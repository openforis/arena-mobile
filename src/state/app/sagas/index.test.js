import {expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {throwError} from 'redux-saga-test-plan/providers';

import appActions from 'state/app/actionCreators';
import appApi from 'state/app/api';
import appSagas from 'state/app/sagas';
import globalInitialState from 'state/initial.state';
import * as navigator from 'state/navigatorService';
import appReducers from 'state/reducers';

const payload = {
  username: 'test@openforis-arena.com',
  password: process.env.TEST_PASSWORD,
  serverUrl: 'mock-url',
};

const error = new Error('error');

const mockUser = {id: 'user_id'};

const expectedAppState = {
  accessData: {
    password: payload.password,
    username: payload.username,
  },
  preferences: {
    serverUrl: payload.serverUrl,
  },
  ui: {
    error: false,
    isLoading: false,
    showNames: false,
  },
};

describe('app saga', () => {
  describe('init connection', () => {
    it('errored user ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))
        .provide([[matchers.call.fn(appApi.auth), throwError(error)]])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {
          ...expectedAppState,
          ui: {
            ...expectedAppState.ui,
            error: true,
          },
        },
      });
    });

    it('user malformed ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))
        .provide([
          [matchers.call.fn(appApi.auth), {malformed: mockUser}],
          [matchers.call.fn(navigator.navigatorDispatch)],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {
          ...expectedAppState,
          ui: {
            ...expectedAppState.ui,
            error: true,
          },
        },
      });
    });

    it('right user ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))
        .provide([
          [matchers.call.fn(appApi.auth), {user: mockUser}],
          [matchers.call.fn(navigator.navigatorDispatch)],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {...expectedAppState},
        user: {...mockUser},
      });
    });
  });
});
