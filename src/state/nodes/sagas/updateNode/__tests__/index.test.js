import MockDate from 'mockdate';
import {expectSaga} from 'redux-saga-test-plan';

import globalInitialState from 'state/initial.state';
import nodesActions from 'state/nodes/actionCreators';
import appReducers from 'state/reducers';
import rootSagas from 'state/sagas';

import {
  error,
  mockUser,
  mockSurvey,
  mockRecord,
  baseMockNode,
  mockDate,
  getCurrentUuid,
} from './mocks';

const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      [mockSurvey.info.uuid]: {...mockSurvey},
    },
  },
  survey: {
    ...globalInitialState.survey,
    data: {
      ...globalInitialState.survey.data,
      ...mockSurvey,
    },
  },
  nodes: {
    ...globalInitialState.nodes,
    data: {
      ...globalInitialState.nodes.data,
      NODE_ONE_UUID: {uuid: 'NODE_ONE_UUID', surveyUuid: mockSurvey.info.uuid},
    },
  },
  records: {
    ...globalInitialState.records,
    data: {
      ...globalInitialState.records.data,
      RECORD_ONE_UUID: {
        uuid: 'RECORD_ONE_UUID',
        surveyUuid: mockSurvey.info.uuid,
      },
    },
  },
};

const _getCurrentUuid = () => getCurrentUuid();
jest.mock('uuid', () => ({
  v4: () => _getCurrentUuid(),
}));

describe('Node updater', () => {
  jest.doMock('moment', () => {
    const moment = require.requireActual('moment-timezone');
    moment.tz.setDefault('UTC');
    return moment;
  });

  beforeAll(() => {
    MockDate.set(mockDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('valid node', async () => {
    const payload = {
      updatedNode: {
        ...baseMockNode,
        value: 5,
      },
    };

    const {storeState} = await expectSaga(rootSagas)
      .withReducer(appReducers, initialState)
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect(storeState).toEqual(initialState);
  });

  it('invalid node ', async () => {
    const payload = {
      updatedNode: {
        ...baseMockNode,
        value: -1,
      },
    };

    const {storeState} = await expectSaga(rootSagas)
      .withReducer(appReducers, initialState)
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect(storeState).toEqual(initialState);
  });
});
