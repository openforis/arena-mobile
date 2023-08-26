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
    settings: {
      images: {
        compressMaxHeight: 1024,
        compressMaxWidth: 1024,
        compressQuality: 0.5,
        isMaxResolution: false,
      },
      survey: {
        taxonomies: {
          defaultVisibleFields: null,
          showOneOptionPerVernacularName: false,
        },
      },
    },
  },
  ui: {
    credentialsError: false,
    serverError: false,
    isLoading: false,
    showNames: false,
    devMode: false,
    style: {
      baseModifier: 1,
      fontBaseModifier: 1,
      colorScheme: 'light',
    },
  },
};

describe('app saga', () => {
  describe('init connection', () => {
    it('Server is a empty string', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload, serverUrl: ' '}))

        .provide([
          [matchers.call.fn(appApi.pingServer), true],
          [matchers.call.fn(appApi.auth), throwError(error)],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {
          ...expectedAppState,
          preferences: {
            ...expectedAppState.preferences,
            serverUrl: ' ',
          },
          ui: {
            ...expectedAppState.ui,
            credentialsError: false,
            serverError: true,
          },
        },
      });
    });

    it('bad url ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))

        .provide([
          [matchers.call.fn(appApi.pingServer), false],
          [matchers.call.fn(appApi.auth), throwError(error)],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {
          ...expectedAppState,
          ui: {
            ...expectedAppState.ui,
            credentialsError: false,
            serverError: true,
          },
        },
      });
    });

    it('errored user ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))

        .provide([
          [matchers.call.fn(appApi.pingServer), true],
          [matchers.call.fn(appApi.auth), throwError(error)],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...globalInitialState,
        app: {
          ...expectedAppState,
          ui: {
            ...expectedAppState.ui,
            credentialsError: true,
          },
        },
      });
    });

    it('user malformed ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))
        .provide([
          [matchers.call.fn(appApi.pingServer), true],
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
            credentialsError: true,
          },
        },
      });
    });

    it('right user ', async () => {
      const {storeState} = await expectSaga(appSagas)
        .withReducer(appReducers)
        .dispatch(appActions.initConnection({...payload}))
        .provide([
          [matchers.call.fn(appApi.pingServer), true],
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
