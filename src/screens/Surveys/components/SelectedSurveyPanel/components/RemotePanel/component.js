import React, {useState, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {
  selectors as surveysSelectors,
  actions as surveysActions,
} from 'state/surveys';

const RemotePanel = ({survey}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [actionType, setActionType] = useState(null);

  const localSurvey = useSelector(state =>
    surveysSelectors.getSurveyById(state, {surveyId: survey.info.id}),
  );

  useEffect(() => {
    if (!localSurvey?.info?.id) {
      setActionType('DOWNLOAD');
      return;
    }

    if (localSurvey?.info?.dateModified < survey?.info?.dateModified) {
      setActionType('UPDATE');
      return;
    }

    setActionType('UP_TO_DATE');
  }, [localSurvey, survey]);

  const handleDownload = useCallback(() => {
    dispatch(surveysActions.fetchSurvey({surveyId: survey.info.id}));
  }, [dispatch, survey]);

  const handleUpdate = useCallback(() => {
    dispatch(surveysActions.updateSurvey({surveyId: survey.info.id}));
  }, [dispatch, survey]);

  const handleSelect = useCallback(() => {
    dispatch(surveysActions.selectSurvey({surveyId: survey.info.id}));
  }, [dispatch, survey]);

  if (actionType === 'DOWNLOAD') {
    return (
      <View>
        <Button
          type="primary"
          label={t('Surveys:selected_survey_panel.remote.cta_download')}
          onPress={handleDownload}
        />
      </View>
    );
  }
  if (actionType === 'UPDATE') {
    return (
      <View>
        <Button
          type="primary"
          label={t('Surveys:selected_survey_panel.remote.cta_update')}
          onPress={handleUpdate}
        />
      </View>
    );
  }
  return (
    <View>
      <Button
        type="primary"
        label={t('Surveys:selected_survey_panel.remote.cta_select')}
        onPress={handleSelect}
      />
    </View>
  );
};

export default RemotePanel;