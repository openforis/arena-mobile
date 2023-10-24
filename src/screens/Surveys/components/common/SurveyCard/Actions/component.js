import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {
  actions as surveyActions,
  selectors as surveySelectors,
} from 'state/survey';
import {
  selectors as surveysSelectors,
  actions as surveysActions,
} from 'state/surveys';

import styles from './styles';

const ActionButton = ({survey}) => {
  const {t} = useTranslation();
  const currentSurveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const actionType = survey?.listAction;
  const dispatch = useDispatch();

  const handleDownload = useCallback(() => {
    dispatch(surveysActions.fetchSurvey({surveyId: survey.id}));
  }, [dispatch, survey]);

  const handleUpdate = useCallback(() => {
    dispatch(surveysActions.updateSurvey({surveyId: survey.id}));
  }, [dispatch, survey]);
  const isLoading = useSelector(surveysSelectors.getIsLoading);
  const handleSelect = useCallback(() => {
    dispatch(surveyActions.selectSurvey({surveyUuid: survey?.uuid}));
  }, [dispatch, survey]);

  const buttonConfig = useMemo(() => {
    if (actionType === 'DOWNLOAD') {
      return {
        label: t('Surveys:actions.download'),
        onPress: handleDownload,
      };
    }
    if (actionType === 'UNPUBLISHED') {
      return {
        label: t('Surveys:actions.unpublished'),
        onPress: () => {},
      };
    }
    if (actionType === 'UPDATE') {
      return {
        label: t('Surveys:actions.update'),
        onPress: handleUpdate,
      };
    }

    return {
      label:
        currentSurveyUuid === survey.uuid
          ? t('Surveys:actions.continue')
          : t('Surveys:actions.select'),
      onPress: handleSelect,
    };
  }, [
    actionType,
    currentSurveyUuid,
    survey,
    t,
    handleDownload,
    handleUpdate,
    handleSelect,
  ]);

  if (survey.id === isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={styles?.colors?.primaryText}
        style={styles.spinner}
      />
    );
  }

  return (
    <Button
      type="ghost"
      label={buttonConfig.label}
      onPress={buttonConfig.onPress}
      disabled={isLoading}
    />
  );
};

const Actions = ({survey, onSelect}) => {
  const handlePress = useCallback(() => {
    onSelect?.(survey);
  }, [survey, onSelect]);
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          type="ghostBlack"
          label={t('Surveys:selected_survey_panel.more_actions')}
          onPress={handlePress}
          customContainerStyle={styles.button}
          customTextStyle={styles.buttonText}
        />
      </View>
      <ActionButton survey={survey} />
    </View>
  );
};

export default Actions;
