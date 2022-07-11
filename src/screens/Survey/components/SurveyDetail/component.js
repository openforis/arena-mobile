import moment from 'moment-timezone';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import baseStyles from 'arena-mobile-ui/styles';
import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import {selectors as surveySelectors} from 'state/survey';

import SurveyLanguageSelector from '../SurveyLanguageSelector';

const SurveyDetail = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const {name: surveyName, label: surveyLabel} = useSelector(
    surveySelectors.getSurveyData,
  );
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
          {t('Home:survey.card.actual_survey')}
        </Text>
        <Text style={baseStyles.textStyle.title}>{surveyLabel}</Text>

        <LabelsAndValues
          size="m"
          items={[
            {label: t('Home:survey.card.name'), value: surveyName},
            {label: t('Home:survey.card.id'), value: survey.id},
            {
              label: t('Common:created'),
              value: moment(survey.dateCreated).fromNow(),
            },
            {
              label: t('Common:modified'),
              value: moment(survey.dateModified).fromNow(),
            },
          ]}
        />

        <SurveyLanguageSelector />
      </View>
    );
  }
  return <View />;
};

export default SurveyDetail;
