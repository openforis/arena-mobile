import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {alert} from 'arena-mobile-ui/utils';
import {
  selectors as surveySelectors,
  actions as surveyActions,
} from 'state/survey';
import {actions as surveysActions} from 'state/surveys';

import styles from './styles';
const Actions = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const numberOfRecords = useSelector(surveySelectors.getNumberRecords);

  const survey = useSelector(surveySelectors.getSurvey);

  const handleDeleteSurveyData = useCallback(() => {
    if (survey) {
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
      });
    }
  }, [dispatch, survey, t]);

  const handleUploadData = useCallback(() => {
<<<<<<< HEAD
    dispatch(surveyActions.uploadSurveyData());
  }, [dispatch]);
=======
    console.log('UPLOAD DATA', survey, dispatch);
  }, [dispatch, survey]);
>>>>>>> bc3032f (actions)

  const handleDeleteSurvey = useCallback(() => {
    if (survey) {
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
      });
    }
  }, [dispatch, survey, t]);

  return (
    <View style={[styles.container]}>
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
<<<<<<< HEAD
        <Button
          type="primary"
          label={t('Actions:upload_data')}
          onPress={handleUploadData}
        />
=======
        <Button type="primary" label="Upload data" onPress={handleUploadData} />
>>>>>>> bc3032f (actions)
      )}
    </View>
  );
};

export default Actions;