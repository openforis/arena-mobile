import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import baseStyles from 'arena-mobile-ui/styles';
import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import {selectors as surveySelectors} from 'state/survey';

const SurveyDetail = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const {
    name: surveyName,
    label: surveyLabel,
    language: surveyLanguage,
  } = useSelector(surveySelectors.getSurveyData);
  const {t} = useTranslation();

  useEffect(() => {
    if (!survey) {
      navigator.reset(ROUTES.HOME);
    }
  }, [survey]);

  if (survey) {
    return (
      <View>
        <Text style={baseStyles.textStyle.secondaryText}>
          {t('Home:survey.card.current_survey')}
        </Text>
        <Text style={baseStyles.textStyle.title}>
          {surveyLabel} ·{surveyName}
        </Text>
        <Text>
          {t('Home:survey.card.id')}: {survey.id}
        </Text>
        <Text>
          {t('Home:survey.card.language')}: {surveyLanguage}
        </Text>
      </View>
    );
  }
  return <View />;
};

export default SurveyDetail;
