import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {Label} from 'arena-mobile-ui/components/LabelsAndValues';
import Select from 'arena-mobile-ui/components/Select';
import {uuidv4} from 'infra/uuid';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

import styles from './styles';

const SurveyLanguageSelector = () => {
  const [key, setKey] = useState(uuidv4());
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
      setKey(uuidv4());
    },
    [surveyLanguage, dispatch],
  );

  return (
    <View style={[styles.container]}>
      <Label size="m" label={t('Home:survey.card.language')} />
      <Select
        key={key}
        items={surveyLanguages}
        onValueChange={handleChange}
        selectedItemKey={surveyLanguage}
        customStyles={styles.pickerStyles}
      />
    </View>
  );
};

export default SurveyLanguageSelector;
