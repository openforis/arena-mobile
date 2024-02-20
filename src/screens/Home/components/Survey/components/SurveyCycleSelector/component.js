import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import SelectWithLabel from 'arena-mobile-ui/components/SelectWithLabel';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

const SurveyCycleSelector = () => {
  const surveyCycle = useSelector(surveySelectors.getSurveyCycle);
  const surveyCycles = useSelector(surveySelectors.getSelectedSurveyCycles);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const handleChange = useCallback(
    cycle => {
      dispatch(
        surveyActions.selectSurveyCycle({
          selectedSurveyCycle: cycle || surveyCycle,
        }),
      );
    },
    [surveyCycle, dispatch],
  );

  const _labelExtractor = useCallback(item => String(Number(item) + 1), []);

  return (
    <SelectWithLabel
      items={surveyCycles}
      labelExtractor={_labelExtractor}
      handleChange={handleChange}
      selectedItemKey={surveyCycle}
      label={t('Home:survey.card.selected_cycle')}
    />
  );
};

export default SurveyCycleSelector;
