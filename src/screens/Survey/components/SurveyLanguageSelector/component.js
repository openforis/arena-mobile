import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import SelectWithLabel from 'arena-mobile-ui/components/SelectWithLabel';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

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

  return (
    <SelectWithLabel
      label={t('Home:survey.card.language')}
      items={surveyLanguages}
      handleChange={handleChange}
      selectedItemKey={surveyLanguage}
    />
  );
};

export default SurveyLanguageSelector;
