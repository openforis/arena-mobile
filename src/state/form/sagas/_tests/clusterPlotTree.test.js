import MockDate from 'mockdate';
import {expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import formActions from 'state/form/actionCreators';
import formSagas from 'state/form/sagas';
import * as navigator from 'state/navigatorService';
import appReducers from 'state/reducers';

import mockDate from './data/mocks/date';
import mockSurvey from './data/mocks/survey';
import initialState from './data/states/000_initial_state';
import addEntity from './data/utils/addEntity';
import addRecord from './data/utils/addRecord';
import deleteNodes from './data/utils/deleteNodes';
import getCurrentUuid from './data/utils/getCurrentUuid';
import selectNode from './data/utils/selectNode';

let prevState = Object.assign({}, initialState);
let expectedState = Object.assign({}, initialState);

const _getCurrentUuid = () => getCurrentUuid();

jest.mock('uuid', () => ({
  v4: () => {
    return _getCurrentUuid();
  },
}));

const expectedRecords = state => {
  return {
    ...state.records,
    data: {
      ...state.records.data,
      'BASE_UUID-1001': {
        ...state.records.data['BASE_UUID-1001'],
        _nodesIndex: {},
        nodes: {},
      },
    },
  };
};

describe('Survey > Cluster, Plot, Tree', () => {
  jest.doMock('moment', () => {
    const moment = require.requireActual('moment-timezone');
    moment.tz.setDefault('UTC');
    return moment;
  });

  jest.doMock('moment', () => {
    const _moment = require.requireActual('moment');
    _moment.tz.setDefault('UTC');
    return _moment;
  });

  beforeAll(() => {
    MockDate.set(mockDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  /*
    New record created and new root nodeDef - Cluster - added
    FROM:
            ()
    TO:
            **CLUSTER_UUID[2]** -> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
                |
                +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
    */
  it('initialize record         ( 1* ) ', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'cluster', nodeIndex: 2},
      addEntity(
        {type: 'plot', parentIndex: 2, currentIndex: 5},
        addEntity({type: 'cluster', currentIndex: 2}, addRecord({}, prevState)),
      ),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(formActions.initializeRecord())
      .provide([[matchers.call.fn(navigator.navigatorDispatch), true]])
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
            **CLUSTER_UUID[2]** -> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
                |
                +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
    TO:
            CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
                |
                +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
    */
  it('Select Plot               ( 1[1*] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 5, parentIndex: 2},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({nodeDef: mockSurvey.nodeDefs.PLOT_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
                            |
                            +----- **TREE_UUID[7]** -> (TREE_KEY_UUID[8])
    */
  it('Select Tree               ( 1[1[1*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 7, parentIndex: 5},
      addEntity({type: 'tree', parentIndex: 5, currentIndex: 7}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
                            |
                            +----- **TREE_UUID[7]** -> (TREE_KEY_UUID[8])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
                            |
                            +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
                            |
                            +----- **TREE_UUID[9]** -> (TREE_KEY_UUID[10])
    */
  it('Add Tree                  ( 1[1[1,2*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = addEntity(
      {type: 'tree', parentIndex: 5, currentIndex: 9},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.createEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
                            |
                            +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
                            |
                            +----- **TREE_UUID[9]** -> (TREE_KEY_UUID[10])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
                            |
                            +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
                            |
                            +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
    */
  it('Back to plot              ( 1[1*[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 5, parentIndex: 2},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({nodeDef: mockSurvey.nodeDefs.PLOT_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
                            |
                            +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
                            |
                            +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- **PLOT_UUID[11]** -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
    */
  it('Add new plot              ( 1[1[1,2],2*] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 11},
      addEntity({type: 'plot', parentIndex: 2, currentIndex: 11}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.createEntity({nodeDef: mockSurvey.nodeDefs.PLOT_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |              +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- **PLOT_UUID[11]** -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- **TREE_UUID[13]** -> (TREE_KEY_UUID[14])
    */
  it('Select Tree               ( 1[1[1,2],2[1*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 13},
      addEntity({type: 'tree', parentIndex: 11, currentIndex: 13}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- **TREE_UUID[13]** -> (TREE_KEY_UUID[14])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13]-> (TREE_KEY_UUID[14])
            |               |
            |               +----- **TREE_UUID[15]** -> (TREE_KEY_UUID[16])
    */
  it('Add Tree                  ( 1[1[1,2],2[1,2*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = addEntity(
      {type: 'tree', parentIndex: 11, currentIndex: 15},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.createEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13]-> (TREE_KEY_UUID[14])
            |               |
            |               +----- **TREE_UUID[15]** -> (TREE_KEY_UUID[16])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- **TREE_UUID[13]**-> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Select Tree 1.2.1         ( 1[1[1,2],2[1*,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 13, parentIndex: 11},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntityNode({
          node: {
            uuid: getCurrentUuid(13),
            nodeDefUuid: mockSurvey.nodeDefs.TREE_UUID.uuid,
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- **TREE_UUID[13]**-> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- **PLOT_UUID[11]** -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Back to Plot 1.2          ( 1[1[1,2],2*[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 11, parentIndex: 2},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({
          nodeDef: mockSurvey.nodeDefs.PLOT_UUID,
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- **PLOT_UUID[11]** -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Move to Plot 1.1          ( 1[1*[1,2],2[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 5, parentIndex: 2},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntityNode({
          node: {
            uuid: getCurrentUuid(5),
            nodeDefUuid: mockSurvey.nodeDefs.PLOT_UUID.uuid,
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[7] -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- **TREE_UUID[7]** -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Move to Tree              ( 1[1[1*,2],2[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 7, parentIndex: 5},
      prevState,
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({
          nodeDef: mockSurvey.nodeDefs.TREE_UUID,
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- **TREE_UUID[7]** -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
            |               |
            |               +-/XXXXX/- **TREE_UUID[7]** -> (TREE_KEY_UUID[8])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Delete Tree 1.1.1         ( 1[1*[-,2],2[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 5, parentIndex: 2},
      deleteNodes(
        {nodeIndexesToDelete: [getCurrentUuid(7), getCurrentUuid(8)]},
        prevState,
      ),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.deleteNodeEntity({
          node: {
            uuid: getCurrentUuid(7),
            nodeDefUuid: mockSurvey.nodeDefs.TREE_UUID.uuid,
            parentUuid: getCurrentUuid(5),
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- **PLOT_UUID[5]** -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        **CLUSTER_UUID[2]**-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +--/XXXXXX/--- PLOT_UUID[5] -> (PLOT_KEY_UUID[6])
            |               |
            |               +----- TREE_UUID[9] -> (TREE_KEY_UUID[10])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Delete Plot 1.1           ( 1*[-,2[1,2]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'cluster', nodeIndex: 2, parentIndex: null},
      deleteNodes(
        {
          nodeIndexesToDelete: [
            getCurrentUuid(5),
            getCurrentUuid(6),
            getCurrentUuid(9),
            getCurrentUuid(10),
          ],
        },
        prevState,
      ),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.deleteNodeEntity({
          node: {
            uuid: getCurrentUuid(5),
            nodeDefUuid: mockSurvey.nodeDefs.PLOT_UUID.uuid,
            parentUuid: getCurrentUuid(2),
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        **CLUSTER_UUID[2]**-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------- PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    TO:
        **CLUSTER_UUID[2]**-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +--/XXXXXX/-PLOT_UUID[11] -> (PLOT_KEY_UUID[12])
            |               |
            |               +----- TREE_UUID[13] -> (TREE_KEY_UUID[14])
            |               |
            |               +----- TREE_UUID[15] -> (TREE_KEY_UUID[16])
    */
  it('Delete Plot 1.2           ( 1*[-] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'cluster', nodeIndex: 2},
      deleteNodes(
        {
          nodeIndexesToDelete: [
            getCurrentUuid(11),
            getCurrentUuid(12),
            getCurrentUuid(13),
            getCurrentUuid(14),
            getCurrentUuid(15),
            getCurrentUuid(16),
          ],
        },
        prevState,
      ),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.deleteNodeEntity({
          node: {
            uuid: getCurrentUuid(11),
            nodeDefUuid: mockSurvey.nodeDefs.PLOT_UUID.uuid,
            parentUuid: getCurrentUuid(2),
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        **CLUSTER_UUID[2]**-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------**PLOT_UUID[17]** -> (PLOT_KEY_UUID[18])
                            |
                            +---------TREE_UUID[19] -> (TREE_KEY_UUID[20])
    */
  it('Add Plot 1.3              ( 1[3*] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 17, parentIndex: 2},

      addEntity({type: 'plot', parentIndex: 2, currentIndex: 17}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.createEntity({nodeDef: mockSurvey.nodeDefs.PLOT_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------**PLOT_UUID[17]** -> (PLOT_KEY_UUID[18])
                            |
                            +---------TREE_UUID[19] -> (TREE_KEY_UUID[20])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------PLOT_UUID[17] -> (PLOT_KEY_UUID[18])
                            |
                            +---------**TREE_UUID[19]** -> (TREE_KEY_UUID[20])
    */
  it('Select tree 1.3.1         ( 1[3[1*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 19, parentIndex: 17},
      addEntity({type: 'tree', parentIndex: 17, currentIndex: 19}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.selectEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------PLOT_UUID[17] -> (PLOT_KEY_UUID[18])
                            |
                            +---------**TREE_UUID[19]** -> (TREE_KEY_UUID[20])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------**PLOT_UUID[17]** -> (PLOT_KEY_UUID[18])
                            |
                            +---/XXX/--TREE_UUID[19] -> (TREE_KEY_UUID[20])
    */
  it('Delete tree 1.3.1         ( 1[3*[-]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'plot', nodeIndex: 17, parentIndex: 2},
      deleteNodes(
        {nodeIndexesToDelete: [getCurrentUuid(19), getCurrentUuid(20)]},
        prevState,
      ),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.deleteNodeEntity({
          node: {
            uuid: getCurrentUuid(19),
            nodeDefUuid: mockSurvey.nodeDefs.TREE_UUID.uuid,
            parentUuid: getCurrentUuid(17),
          },
        }),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });

  /*
    FROM:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------**PLOT_UUID[17]** -> (PLOT_KEY_UUID[18])
    TO:
        CLUSTER_UUID[2]-> (CLUSTER_KEY_UUID[3], CLUSTER_NAME_UUID[4])
            |
            +---------PLOT_UUID[17] -> (PLOT_KEY_UUID[18])
                            |
                            +---------**TREE_UUID[21]** -> (TREE_KEY_UUID[22])
    */
  it('Add tree 1.3.2            ( 1[3[2*]] )', async () => {
    prevState = Object.assign({}, expectedState);

    expectedState = selectNode(
      {type: 'tree', nodeIndex: 21, parentIndex: 17},
      addEntity({type: 'tree', parentIndex: 17, currentIndex: 21}, prevState),
    );

    const {storeState} = await expectSaga(formSagas)
      .withReducer(appReducers, prevState)
      .dispatch(
        formActions.createEntity({nodeDef: mockSurvey.nodeDefs.TREE_UUID}),
      )
      .silentRun();

    expect({
      ...storeState,
      form: {...storeState.form, validation: {}},
      records: expectedRecords(storeState),
    }).toEqual({
      ...expectedState,
      form: {...expectedState.form, validation: {}},
      records: expectedRecords(expectedState),
    });
  });
});
