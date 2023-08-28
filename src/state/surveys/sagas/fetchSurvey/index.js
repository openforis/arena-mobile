import {put, select, call} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import {handleShowToast} from 'infra/toast';
import {selectors as appSelectors} from 'state/app';

import surveysActions from '../../actionCreators';
import surveysApi from '../../api';
import surveysSelectors from '../../selectors';

function* handleFetchSurvey({payload}) {
  try {
    const {surveyId, isUpdate = false} = payload;
    yield put(surveysActions.setLoading({isLoading: surveyId}));

    const serverUrl = yield select(appSelectors.getServerUrl);
    if (isUpdate) {
      const currentSurvey = yield select(state =>
        surveysSelectors.getSurveyById(state, surveyId),
      );

      yield call(checkIfCurrentServerIsTheSurveysServer, {
        survey: currentSurvey,
        serverUrl,
      });
    }

    const surveyWithNodeDefs = yield call(surveysApi.getSurveyPopulatedById, {
      serverUrl,
      surveyId,
    });

    yield put(
      surveysActions.setSurvey({
        survey: {...surveyWithNodeDefs, serverUrl},
      }),
    );
  } catch (e) {
    console.log(e);
    yield call(handleShowToast, {message: e?.message});
  } finally {
    console.log('Finally');

    yield put(surveysActions.setLoading({isLoading: false}));
  }
}

export default handleFetchSurvey;
