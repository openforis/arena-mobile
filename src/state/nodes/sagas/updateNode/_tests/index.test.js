import MockDate from 'mockdate';
import moment from 'moment';
import {expectSaga} from 'redux-saga-test-plan';

import globalInitialState from 'state/initial.state';
import nodesActions from 'state/nodes/actionCreators';
import appReducers from 'state/reducers';
import rootSagas from 'state/sagas';

import {
  mockSurvey,
  baseClusterMockNode,
  baseMockNode as _baseMockNode,
  mockDate,
  getCurrentUuid,
} from './mocks';

const baseMockNode = {
  ..._baseMockNode,
  recordUuid: 'RECORD_ONE_UUID',
};

const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      [mockSurvey.uuid]: {...mockSurvey},
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
      [baseClusterMockNode.uuid]: {
        ...baseClusterMockNode,
        recordUuid: 'RECORD_ONE_UUID',
      },
      [getCurrentUuid(2)]: {...baseMockNode},
      NODE_ONE_UUID: {
        uuid: 'NODE_ONE_UUID',
        surveyUuid: mockSurvey.uuid,
        recordUuid: 'RECORD_TWO_UUID',
      },
    },
  },
  records: {
    ...globalInitialState.records,
    data: {
      ...globalInitialState.records.data,
      RECORD_ONE_UUID: {
        preview: false,
        uuid: 'RECORD_ONE_UUID',
        surveyUuid: mockSurvey.uuid,
        lastModifiedAt: moment(mockDate).toISOString(),

        nodes: [],
        _nodesIndex: {
          // this index is one of the problems of our data model, I have to recreate here to pass the tests and have compatibility with arena-core, of sure the best way to do that is recreate there if needed. Or even better never trust on Caches.
          nodeRootUuid: baseClusterMockNode.uuid,
          nodesByDef: {
            [baseClusterMockNode.nodeDefUuid]: {
              [baseClusterMockNode.uuid]: true,
            },
            [baseMockNode.nodeDefUuid]: {
              [getCurrentUuid(2)]: true,
            },
          },
          nodesByParentAndChildDef: {
            [baseClusterMockNode.uuid]: {
              [baseMockNode.nodeDefUuid]: {
                [getCurrentUuid(2)]: true,
              },
            },
          },
        },
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

    expect(storeState).toEqual({
      ...initialState,
      nodes: {
        ...initialState.nodes,
        ui: {
          ...initialState.nodes.ui,
          lastNodeDefUuid: 'NODE_DEF_UUID',
        },
      },
    });
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

    expect({
      ...storeState,
      records: {
        ...storeState.records,
        data: {
          ...storeState.records.data,
          RECORD_ONE_UUID: {
            ...storeState.records.data.RECORD_ONE_UUID,
            nodes: [],
          },
        },
      },
    }).toEqual({
      ...initialState,
      form: {
        ...initialState.form,
        validation: {
          errors: [],
          fields: {},
          valid: true,
          warnings: [],
        },
      },
      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: 5},
        },
        ui: {
          ...initialState.nodes.ui,
          lastNodeDefUuid: 'NODE_DEF_UUID',
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

    expect({
      ...storeState,
      records: {
        ...storeState.records,
        data: {
          ...storeState.records.data,
          RECORD_ONE_UUID: {
            ...storeState.records.data.RECORD_ONE_UUID,
            nodes: [],
          },
        },
      },
    }).toEqual({
      ...initialState,
      form: {
        ...initialState.form,
        validation: {
          errors: [],
          fields: {
            [getCurrentUuid(2)]: {
              errors: [],
              fields: {
                value: {
                  errors: [
                    {
                      key: 'record.attribute.customValidation',
                      messages: {
                        LANG: 'this_number > 0',
                      },
                      params: undefined,
                      severity: 'error',
                      valid: false,
                    },
                  ],
                  fields: {},
                  valid: false,
                  warnings: [],
                },
              },
              valid: false,
              warnings: [],
            },
          },
          valid: false,
          warnings: [],
        },
      },

      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: -1},
        },
        ui: {
          ...initialState.nodes.ui,
          lastNodeDefUuid: baseMockNode.nodeDefUuid,
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
        },
      })
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect({
      ...storeState,
      records: {
        ...storeState.records,
        data: {
          ...storeState.records.data,
          RECORD_ONE_UUID: {
            ...storeState.records.data.RECORD_ONE_UUID,
            nodes: [],
          },
        },
      },
    }).toEqual({
      ...initialState,
      form: {
        ...initialState.form,
        validation: {
          errors: [],
          fields: {},
          valid: true,
          warnings: [],
        },
      },

      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: 5},
        },
        ui: {
          ...initialState.nodes.ui,
          lastNodeDefUuid: 'NODE_DEF_UUID',
        },
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
        },
      })
      .dispatch(nodesActions.updateNode(payload))
      .silentRun();

    expect({
      ...storeState,
      records: {
        ...storeState.records,
        data: {
          ...storeState.records.data,
          RECORD_ONE_UUID: {
            ...storeState.records.data.RECORD_ONE_UUID,
            nodes: [],
          },
        },
      },
    }).toEqual({
      ...initialState,
      form: {
        ...initialState.form,
        validation: {
          errors: [],
          fields: {
            [getCurrentUuid(2)]: {
              errors: [],
              fields: {
                value: {
                  errors: [
                    {
                      key: 'record.attribute.customValidation',
                      messages: {
                        LANG: 'this_number > 0',
                      },
                      params: undefined,
                      severity: 'error',
                      valid: false,
                    },
                  ],
                  fields: {},
                  valid: false,
                  warnings: [],
                },
              },
              valid: false,
              warnings: [],
            },
          },
          valid: false,
          warnings: [],
        },
      },

      nodes: {
        ...initialState.nodes,
        data: {
          ...initialState.nodes.data,
          [getCurrentUuid(2)]: {...baseMockNode, value: -3},
        },
        ui: {
          ...initialState.nodes.ui,
          lastNodeDefUuid: 'NODE_DEF_UUID',
        },
      },
    });
  });
});
