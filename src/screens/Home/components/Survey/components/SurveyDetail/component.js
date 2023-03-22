import moment from 'moment-timezone';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import baseStyles from 'arena-mobile-ui/styles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const SurveyDetail = () => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const survey = useSelector(surveySelectors.getSurvey);

  const {
    name: surveyName,
    label: surveyLabel,
    cycle: surveyCycle,
    language: surveyLanguage,
  } = useSelector(surveySelectors.getSurveyData);

  return (
    <Card customStyles={[styles.container]}>
      <View style={[styles.buttonContainer]}>
        <Button
          type="ghost"
          label={t('Home:survey.card.go_to_survey_options')}
          onPress={navigateTo({route: routes.SURVEY})}
        />
      </View>
      <Text style={baseStyles.textStyle.secondaryText}>
        {t('Home:survey.card.active_survey')}
      </Text>
      <Text style={baseStyles.textStyle.title}>
        {surveyLabel} ·{surveyLabel}{' '}
      </Text>

      <LabelsAndValues
        size="s"
        items={[
          {label: t('Home:survey.card.name'), value: surveyName},
          {
            label: t('Common:created'),
            value: moment(survey.dateCreated).fromNow(),
          },
          {
            label: t('Common:modified'),
            value: moment(survey.dateModified).fromNow(),
          },
          {
            label: t('Home:survey.card.language'),
            value: surveyLanguage,
          },
          {
            label: t('Home:survey.card.cycle'),
            value: String(Number(surveyCycle) + 1),
          },
        ]}
      />
    </Card>
  );
};

export default SurveyDetail;
