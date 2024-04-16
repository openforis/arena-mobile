import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {alert} from 'arena-mobile-ui/utils';
import {
  actions as surveyActions,
  selectors as surveySelectors,
} from 'state/survey';
import {actions as surveysActions} from 'state/surveys';

const LocalPanel = ({survey, unSelect}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const currentSurveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);

  const handleDelete = useCallback(() => {
    const requiredText = t(
      'Surveys:selected_survey_panel.delete.alert.delete_survey',
    );

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
      onDismiss: () => {},
      requiredText,
      requiredTextMessage: t('Common:required_text', {
        requiredText,
      }),
    });
  }, [dispatch, survey, unSelect, t]);

  const handleSelect = useCallback(() => {
    dispatch(surveyActions.selectSurvey({surveyUuid: survey?.uuid}));
  }, [dispatch, survey]);

  return (
    <View>
      <Button
        type="primary"
        label={
          currentSurveyUuid === survey.uuid
            ? t('Surveys:actions.continue')
            : t('Surveys:actions.select')
        }
        onPress={handleSelect}
      />

      <Button
        type="delete"
        label={t('Surveys:actions.delete')}
        onPress={handleDelete}
      />
    </View>
  );
};

export default LocalPanel;
