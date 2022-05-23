import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {alert} from 'arena-mobile-ui/utils';
import {actions as surveyActions} from 'state/survey';
import {actions as surveysActions} from 'state/surveys';

const LocalPanel = ({survey, unSelect}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    alert({
      title: t('Surveys:selected_survey_panel.delete.alert.title'),
      message: t('Surveys:selected_survey_panel.delete.alert.message', {
        name: survey.props.name,
      }),
      acceptText: t('Surveys:selected_survey_panel.delete.alert.accept'),
      dismissText: t('Surveys:selected_survey_panel.delete.alert.dismiss'),
      onAccept: () => {
        dispatch(
          surveysActions.deleteSurvey({
            surveyUuid: survey?.uuid,
            callBack: () => unSelect(),
          }),
        );
      },
      onDismiss: () => null,
    });
  }, [dispatch, survey, unSelect, t]);

  const handleSelect = useCallback(() => {
    dispatch(surveyActions.selectSurvey({surveyUuid: survey?.uuid}));
  }, [dispatch, survey]);

  return (
    <View>
      <Button
        type="primary"
        label={t('Surveys:selected_survey_panel.remote.cta_select')}
        onPress={handleSelect}
      />

      <Button
        type="delete"
        label={t('Surveys:selected_survey_panel.local.cta_delete')}
        onPress={handleDelete}
      />
    </View>
  );
};

export default LocalPanel;
