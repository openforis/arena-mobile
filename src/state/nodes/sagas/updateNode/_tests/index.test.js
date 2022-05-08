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
      [getCurrentUuid(2)]: {...baseMockNode},
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

  it('node doesnt exists', async () => {
    const payload = {
      updatedNode: {
        ...baseMockNode,
        uuid: 'NOT_DEFINED_UUID',
        value: 5,
      },
    };

    const {storeState} = await expectSaga(rootSagas)
      .withReducer(appReducers, initialState)
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect(storeState).toEqual(initialState);
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

    expect(storeState).toEqual({
      ...initialState,
      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: 5},
        },
      },
    });
  });

  it('Node has validation, It was valid and The change makes it invalid', async () => {
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

    expect(storeState).toEqual({
      ...initialState,
      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: -1},
        },
        errors: {
          [getCurrentUuid(2)]: [{error: 'ERROR'}],
        },
      },
    });
  });

  it('Node has validation, It was invalid and The change makes it valid', async () => {
    const payload = {
      updatedNode: {
        ...baseMockNode,
        value: 5,
      },
    };

    const {storeState} = await expectSaga(rootSagas)
      .withReducer(appReducers, {
        ...initialState,
        nodes: {
          ...initialState.nodes,
          data: {
            ...initialState.nodes.data,
            [getCurrentUuid(2)]: {...baseMockNode, value: -1},
          },
          errors: {
            [getCurrentUuid(2)]: [{error: 'ERROR'}],
          },
        },
      })
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect(storeState).toEqual({
      ...initialState,
      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: 5},
        },
        errors: {},
      },
    });
  });

  it('Node has validation, It was invalid and the change keeps it invalid', async () => {
    const payload = {
      updatedNode: {
        ...baseMockNode,
        value: -3,
      },
    };

    const {storeState} = await expectSaga(rootSagas)
      .withReducer(appReducers, {
        ...initialState,
        nodes: {
          ...initialState.nodes,
          data: {
            ...initialState.nodes.data,
            [getCurrentUuid(2)]: {...baseMockNode, value: -1},
          },
          errors: {
            [getCurrentUuid(2)]: [{error: 'ERROR'}],
          },
        },
      })
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect(storeState).toEqual({
      ...initialState,
      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: -3},
        },
        errors: {
          [getCurrentUuid(2)]: [{error: 'ERROR'}],
        },
      },
    });
  });
});
