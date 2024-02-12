import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {useDispatch, useSelector} from 'react-redux';

import {alert} from 'arena-mobile-ui/utils';

import {useNumberRecords} from 'state/records/hooks';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

const RemoveAllSurveyData = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const numberOfRecords = useNumberRecords();

  const survey = useSelector(surveySelectors.getSurvey);

  const handleDeleteSurveyData = useCallback(() => {
    if (survey) {
      const requiredText = t(
        'Surveys:selected_survey_panel.delete.alert.delete_data',
      );

      alert({
        title: t('Surveys:selected_survey_panel.delete.alert.title'),
        message: t('Surveys:selected_survey_panel.delete.alert.message', {
          name: survey.props.name,
        }),
        acceptText: t('Surveys:selected_survey_panel.delete.alert.accept'),
        dismissText: t('Surveys:selected_survey_panel.delete.alert.dismiss'),
        onAccept: () => {
          dispatch(surveyActions.deleteSurveyData({surveyUuid: survey?.uuid}));
        },

        requiredText,
        requiredTextMessage: t('Common:required_text', {requiredText}),
      });
    }
  }, [dispatch, survey, t]);

  return (
    <>
      {numberOfRecords > 0 && (
        <TouchableIcon
          iconName="trash-can-outline"
          onPress={handleDeleteSurveyData}
        />
      )}
    </>
  );
};

export default RemoveAllSurveyData;
