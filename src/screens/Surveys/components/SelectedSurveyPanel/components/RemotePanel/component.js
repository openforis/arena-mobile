import React, {useState, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
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

const RemotePanel = ({survey}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [actionType, setActionType] = useState(null);
  const isLoading = useSelector(surveysSelectors.getIsLoading);
  const localSurvey = useSelector(state =>
    surveysSelectors.getSurveyByUuid(state, survey?.uuid),
  );
  const currentSurveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);

  useEffect(() => {
    if (!localSurvey?.uuid) {
      setActionType('DOWNLOAD');
      return;
    }

    if (localSurvey?.dateModified < survey?.dateModified) {
      setActionType('UPDATE');
      return;
    }

    setActionType('UP_TO_DATE');
  }, [localSurvey, survey]);

  const handleDownload = useCallback(() => {
    dispatch(surveysActions.fetchSurvey({surveyId: survey.id}));
  }, [dispatch, survey]);

  const handleUpdate = useCallback(() => {
    dispatch(surveysActions.updateSurvey({surveyId: survey.id}));
  }, [dispatch, survey]);

  const handleSelect = useCallback(() => {
    dispatch(surveyActions.selectSurvey({surveyUuid: survey?.uuid}));
  }, [dispatch, survey]);

  if (actionType === 'DOWNLOAD') {
    return (
      <View>
        <Button
          type="primary"
          label={t('Surveys:actions.download')}
          onPress={handleDownload}
          disabled={isLoading}
        />
      </View>
    );
  }
  if (actionType === 'UPDATE') {
    return (
      <View>
        <Button
          type="primary"
          label={t('Surveys:actions.update')}
          onPress={handleUpdate}
          disabled={isLoading}
        />
      </View>
    );
  }
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
        disabled={isLoading}
      />
    </View>
  );
};

export default RemotePanel;
