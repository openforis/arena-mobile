import {StackActions} from '@react-navigation/core';
import {put, select, call} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import {createSurveyFolder, persistRecordsAndNodes} from 'state/__persistence';
import {actions as formActions} from 'state/form';
import * as navigator from 'state/navigatorService';
import surveysSelectors from 'state/surveys/selectors';

import surveyActions from '../../actionCreators';

function* handleSelectSurvey({payload}) {
  try {
    const {surveyUuid} = payload;
    const survey = yield select(state =>
      surveysSelectors.getSurveyByUuid(state, surveyUuid),
    );
    yield call(persistRecordsAndNodes);

    if (!survey) {
      throw Error('Missing survey');
    }
    // TODO get the default or the latests cycle and set that as default
    yield call(createSurveyFolder, {surveyUuid, cycle: '0'});

    yield put(surveyActions.setSurvey({survey}));
    yield put(formActions.clean());

    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
  } catch (error) {
    console.log('Error', error.message);
  } finally {
    console.log('Finally');
  }
}

export default handleSelectSurvey;