import {expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import globalInitialState from 'state/initial.state';
import * as navigator from 'state/navigatorService';
import appReducers from 'state/reducers';
import surveyActions from 'state/survey/actionCreators';
import surveySagas from 'state/survey/sagas';

const payload = {
  surveyUuid: 'SURVEY_1',
};

const mockSurvey = {
  id: 'ID',
  info: {
    uuid: 'SURVEY_UUID',
    props: {
      languages: ['LANG'],
    },
  },
};

const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      SURVEY_1: {...mockSurvey},
    },
  },
};

describe('survey saga', () => {
  describe('select survey', () => {
    it('Survey is not into the device ', async () => {
      const {storeState} = await expectSaga(surveySagas)
        .withReducer(appReducers, initialState)
        .dispatch(
          surveyActions.selectSurvey({
            ...payload,
            surveyUuid: 'MISSING_SURVEY_UUID',
          }),
        )
        .provide([[matchers.call.fn(navigator.navigatorDispatch), true]])
        .silentRun();

      expect(storeState).toEqual(initialState);
    });

    it('Survey is into the device ', async () => {
      const {storeState} = await expectSaga(surveySagas)
        .withReducer(appReducers, initialState)
        .dispatch(surveyActions.selectSurvey({...payload}))
        .provide([[matchers.call.fn(navigator.navigatorDispatch), true]])
        .silentRun();

      expect(storeState).toEqual({
        ...initialState,

        survey: {
          ...initialState.survey,
          data: {
            ...initialState.survey.data,
            ...mockSurvey,
          },
          ui: {
            ...initialState.survey.ui,
            selectedSurveyLanguage: mockSurvey.info.props.languages[0],
          },
        },
      });
    });
  });
});
