import {Languages} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import SelectWithLabel from 'arena-mobile-ui/components/SelectWithLabel';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

const getLanguageLabel = language => Languages[language].en || language;

const SurveyLanguageSelector = () => {
  const surveyLanguage = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const surveyLanguages = useSelector(
    surveySelectors.getSelectedSurveyLanguages,
  );
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const handleChange = useCallback(
    language => {
      dispatch(
        surveyActions.selectSurveyLanguage({
          selectedSurveyLanguage: language || surveyLanguage,
        }),
      );
    },
    [surveyLanguage, dispatch],
  );

  if (surveyLanguages.length <= 1) {
    return (
      <LabelsAndValues
        size="m"
        items={[
          {
            label: t('Home:survey.card.language'),
            value: getLanguageLabel(surveyLanguage),
          },
        ]}
      />
    );
  }
  return (
    <SelectWithLabel
      label={t('Home:survey.card.language')}
      items={surveyLanguages}
      handleChange={handleChange}
      selectedItemKey={surveyLanguage}
      labelExtractor={getLanguageLabel}
    />
  );
};

export default SurveyLanguageSelector;
