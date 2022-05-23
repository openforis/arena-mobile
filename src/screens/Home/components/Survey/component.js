import * as React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';

import NoLocalSurveys from './components/NoLocalSurveys';
import NoSurveySelected from './components/NoSurveySelected';
import SurveyDetail from './components/SurveyDetail';

const Survey = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const numSurveys = useSelector(surveysSelectors.getNumberOfLocalSurveys);

  if (survey?.id) {
    return (
      <>
        <SurveyDetail />
      </>
    );
  }

  if (numSurveys > 0) {
    return <NoSurveySelected />;
  }

  if (numSurveys <= 0) {
    return <NoLocalSurveys />;
  }
  return <></>;
};

export default Survey;
