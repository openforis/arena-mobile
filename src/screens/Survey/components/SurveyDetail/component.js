import moment from 'moment-timezone';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import {ROUTES} from 'navigation/constants';
import * as navigator from 'state/navigatorService';
import {useNumberRecords} from 'state/records/hooks';
import {selectors as surveySelectors} from 'state/survey';

import SurveyCycleSelector from '../SurveyCycleSelector';
import SurveyLanguageSelector from '../SurveyLanguageSelector';

const SHOW_CYCLE_SELECTOR = false;

const SurveyDetail = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const surveyCycles = useSelector(surveySelectors.getSurveyCycles);
  const {
    name: surveyName,
    label: surveyLabel,
    description: surveyDescription,
    numberOfCycles,
    cycle,
  } = useSelector(surveySelectors.getSurveyData);
  const {t} = useTranslation();

  const numberOfRecords = useNumberRecords();

  useEffect(() => {
    if (!survey) {
      navigator.reset(ROUTES.HOME);
    }
  }, [survey]);

  if (survey) {
    return (
      <View>
        <TextBase type="secondary" size="s">
          {t('Home:survey.card.active_survey')}
        </TextBase>
        <TextTitle>{surveyLabel}</TextTitle>

        <TextBase type="secondary">{surveyDescription}</TextBase>

        <LabelsAndValues
          size="m"
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
              label: t('Home:survey.card.cycle'),
              value: `${t('Home:survey.card.cycle_value', {
                numberOfCycles,
                cycle: `${String(Number(cycle) + 1)} (${
                  surveyCycles[cycle]?.dateStart
                }${
                  surveyCycles[cycle]?.dateEnd
                    ? ` - ${surveyCycles[cycle]?.dateEnd}`
                    : ''
                })`,
              })}`,
            },
          ]}
        />

        <SurveyLanguageSelector />
        <LabelsAndValues
          size="m"
          items={[
            {
              label: t('Home:survey.card.number_of_records'),
              value: numberOfRecords,
            },
          ]}
        />
        {SHOW_CYCLE_SELECTOR && <SurveyCycleSelector />}
      </View>
    );
  }
  return <View />;
};

export default SurveyDetail;
