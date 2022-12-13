import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {alert} from 'arena-mobile-ui/utils';
import {selectors as appSelectors} from 'state/app';
import {actions as formActions} from 'state/form';
import {useNumberRecords} from 'state/records/hooks';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';
import {actions as surveysActions} from 'state/surveys';

const IMPORT_RECORDS_ENABLED = false;
import styles from './styles';
const Actions = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const numberOfRecords = useNumberRecords();
  const isDevModeEnabled = useSelector(appSelectors.isDevModeEnabled);
  const survey = useSelector(surveySelectors.getSurvey);

  const handleDeleteSurveyData = useCallback(() => {
    if (survey) {
      const requiredText = t(
        'Surveys:selected_survey_panel.delete.alert.required',
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

  const handleUploadData = useCallback(() => {
    dispatch(surveyActions.uploadSurveyData());
  }, [dispatch]);

  const handleImportRecords = useCallback(() => {
    dispatch(formActions.importRecords());
  }, [dispatch]);

  const handleDeleteSurvey = useCallback(() => {
    if (survey) {
      const requiredText = t(
        'Surveys:selected_survey_panel.delete.alert.required',
      );

      alert({
        title: t('Surveys:selected_survey_panel.delete.alert.title'),
        message: t('Surveys:selected_survey_panel.delete.alert.message', {
          name: survey.props.name,
        }),
        acceptText: t('Surveys:selected_survey_panel.delete.alert.accept'),
        dismissText: t('Surveys:selected_survey_panel.delete.alert.dismiss'),
        onAccept: () => {
          dispatch(surveysActions.deleteSurvey({surveyUuid: survey?.uuid}));
        },
        requiredText,
        requiredTextMessage: t('Common:required_text', {requiredText}),
      });
    }
  }, [dispatch, survey, t]);

  return (
    <View style={[styles.container]}>
      {isDevModeEnabled && IMPORT_RECORDS_ENABLED && (
        <Button
          type="primary"
          label={t('Actions:import_records')}
          onPress={handleImportRecords}
        />
      )}

      {numberOfRecords > 0 && (
        <Button
          type="delete"
          label={t('Actions:remove_records')}
          onPress={handleDeleteSurveyData}
        />
      )}

      <Button
        type="delete"
        label={t('Actions:remove_survey')}
        onPress={handleDeleteSurvey}
      />

      <View style={[styles.separator]} />

      {numberOfRecords > 0 && (
        <Button
          type="primary"
          label={t('Actions:upload_data')}
          onPress={handleUploadData}
        />
      )}
    </View>
  );
};

export default Actions;
