import {expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {throwError} from 'redux-saga-test-plan/providers';

import globalInitialState from 'state/initial.state';
import * as navigator from 'state/navigatorService';
import appReducers from 'state/reducers';
import surveysActions from 'state/surveys/actionCreators';
import surveysApi from 'state/surveys/api';
import surveysSagas from 'state/surveys/sagas';

const payload = {
  surveyUuid: 'SURVEY_1',
};

const error = new Error('error');

const mockSurvey = {
  id: 'ID',
  uuid: 'SURVEY_UUID',
  props: {
    languages: ['LANG'],
  },
  nodeDefs: {
    NODE_DEF_UUID: {id: 'NODE_DEF_ID', uuid: 'NODE_DEF_UUID'},
  },
};

const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      [mockSurvey.uuid]: {...mockSurvey},
    },
  },
};

const initialStateWithNodesAndRecords = {
  ...initialState,
  records: {
    ...globalInitialState.records,
    data: {
      ...globalInitialState.records.data,
      RECORD_ONE_UUID: {
        uuid: 'RECORD_ONE_UUID',
        surveyUuid: mockSurvey.uuid,
      },
    },
  },
  nodes: {
    ...globalInitialState.nodes,
    data: {
      ...globalInitialState.nodes.data,
      NODE_ONE_UUID: {uuid: 'NODE_ONE_UUID', surveyUuid: mockSurvey.uuid},
    },
  },
  survey: {
    ...globalInitialState.survey,
    data: {
      ...globalInitialState.survey.data,
      ...mockSurvey,
    },
  },
  form: {
    ...globalInitialState.form,
    data: {
      ...globalInitialState.form.data,
      record: 'RECORD',
    },
  },
};

describe('surveys sagas', () => {
  describe('fetch survey', () => {
    it('Survey doesnt exist ', async () => {
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers)
        .dispatch(
          surveysActions.fetchSurvey({
            ...payload,
            surveyId: 'SURVEY_ID',
          }),
        )
        .provide([
          [
            matchers.call.fn(surveysApi.getSurveyPopulatedById),
            throwError(error),
          ],
        ])
        .silentRun();

      expect(storeState).toEqual(globalInitialState);
    });
    it('Survey exists ', async () => {
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers)
        .dispatch(
          surveysActions.fetchSurvey({
            ...payload,
            surveyId: 'SURVEY_ID',
          }),
        )
        .provide([
          [matchers.call.fn(surveysApi.getSurveyPopulatedById), mockSurvey],
        ])
        .silentRun();

      expect(storeState).toEqual(initialState);
    });
  });

  describe('update survey', () => {
    it('update survey ', async () => {
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers, initialState)
        .dispatch(
          surveysActions.fetchSurvey({
            ...payload,
            surveyId: 'SURVEY_ID',
          }),
        )
        .provide([
          [
            matchers.call.fn(surveysApi.getSurveyPopulatedById),
            {...mockSurvey, updated_value: 'VALUE'},
          ],
        ])
        .silentRun();

      expect(storeState).toEqual({
        ...initialState,
        surveys: {
          ...initialState.surveys,
          data: {
            ...initialState.surveys.data,
            [mockSurvey.uuid]: {
              ...initialState.surveys.data[mockSurvey.uuid],
              updated_value: 'VALUE',
            },
          },
        },
      });
    });
  });

  describe('delete survey', () => {
    it('survey exists, is not the current survey and have records and nodes', async () => {
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers, {
          ...initialStateWithNodesAndRecords,
          survey: {
            ...initialStateWithNodesAndRecords.survey,
            data: {uuid: 'OTHER_SURVEY'},
          },
        })
        .dispatch(
          surveysActions.deleteSurvey({
            ...payload,
            surveyUuid: mockSurvey.uuid,
          }),
        )
        .provide([[matchers.call.fn(navigator.navigatorDispatch), true]])
        .silentRun();

      expect(storeState).toEqual({
        ...initialStateWithNodesAndRecords,
        survey: {
          ...initialStateWithNodesAndRecords.survey,
          data: {uuid: 'OTHER_SURVEY'},
        },
        surveys: {
          ...globalInitialState.surveys,
        },
        records: {
          ...globalInitialState.records,
        },
        nodes: {
          ...globalInitialState.nodes,
        },
      });
    });

    it('survey exists, is the current survey and have records and nodes', async () => {
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers, initialState)
        .dispatch(
          surveysActions.deleteSurvey({
            ...payload,
            surveyUuid: mockSurvey.uuid,
          }),
        )
        .provide([[matchers.call.fn(navigator.navigatorDispatch), true]])
        .silentRun();

      expect(storeState).toEqual({
        ...initialStateWithNodesAndRecords,
        survey: {
          ...globalInitialState.survey,
        },
        surveys: {
          ...globalInitialState.surveys,
        },
        records: {
          ...globalInitialState.records,
        },
        nodes: {
          ...globalInitialState.nodes,
        },
        form: {
          ...globalInitialState.form,
        },
      });
    });

    it('survey doesnt exists and have records and nodes ', async () => {
      const _fakeCallBack = () => null;
      const {storeState} = await expectSaga(surveysSagas)
        .withReducer(appReducers, initialStateWithNodesAndRecords)
        .dispatch(
          surveysActions.deleteSurvey({
            ...payload,
            surveyUuid: 'OTHER_SURVEY_UUID',
            callBack: _fakeCallBack,
          }),
        )
        .provide([[matchers.call.fn(_fakeCallBack), true]])
        .silentRun();

      expect(storeState).toEqual(initialStateWithNodesAndRecords);
    });
  });
});
