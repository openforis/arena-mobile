import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveySelectors} from 'state/survey';

const SurveyDetail = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const surveyLanguage = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const {t} = useTranslation();

  return (
    <View>
      <Text style={baseStyles.textStyle.secondaryText}>
        {t('Home:survey.card.current_survey')}
      </Text>
      <Text style={baseStyles.textStyle.title}>
        {survey.info.props.labels[surveyLanguage]} ·{survey.info.props.name}{' '}
      </Text>
      <Text>
        {t('Home:survey.card.id')}: {survey.info.id}
      </Text>
      <Text>
        {t('Home:survey.card.language')}: {surveyLanguage}
      </Text>
    </View>
  );
};

export default SurveyDetail;
