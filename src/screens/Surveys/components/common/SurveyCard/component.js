import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as appSelectors} from 'state/app';
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
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
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

  if (actionType === 'DOWNLOAD') {
    return (
      <Button
        type="ghost"
        label={t('Surveys:selected_survey_panel.remote.cta_download')}
        onPress={handleDownload}
        disabled={isLoading}
      />
    );
  }
  if (actionType === 'UPDATE') {
    return (
      <Button
        type="ghost"
        label={t('Surveys:selected_survey_panel.remote.cta_update')}
        onPress={handleUpdate}
        disabled={isLoading}
      />
    );
  }
  return (
    <Button
      type="ghost"
      label={
        currentSurveyUuid === survey.uuid
          ? t('Surveys:selected_survey_panel.remote.cta_continue')
          : t('Surveys:selected_survey_panel.remote.cta_select')
      }
      onPress={handleSelect}
      disabled={isLoading}
    />
  );
};

const SurveyStatus = ({survey}) => {
  const actionType = survey?.listAction;
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const {t} = useTranslation();
  const config = useMemo(() => {
    if (actionType === 'DOWNLOAD') {
      return {
        value: t('Surveys:status_labels.not_in_device'),
        color: 'info',
        boder: true,
      };
    }
    if (actionType === 'UPDATE') {
      return {
        value: t('Surveys:status_labels.update'),
        color: 'alert',
        boder: true,
      };
    }

    if (survey?.serverUrl && survey?.serverUrl !== currentServerUrl) {
      return {
        value: t('Surveys:status_labels.not_this_server'),
        color: 'alert',
        boder: true,
      };
    }
    return {
      value: t('Surveys:status_labels.ready'),
      color: 'info',
      boder: true,
    };
  }, [t, actionType, survey, currentServerUrl]);

  return (
    <LabelsAndValues
      items={[
        {
          label: t('Surveys:status'),
          ...config,
        },
      ]}
    />
  );
};
const SurveyCard = ({
  survey,
  onSelect,
  isSelected,
  isLocalSurvey,
  showIcons,
  surveysOrigin,
}) => {
  const handlePress = useCallback(() => {
    onSelect?.(survey);
  }, [survey, onSelect]);
  const {t} = useTranslation();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);

  return (
    <TouchableCard
      customStyles={[styles.container, isLocalSurvey ? styles.selected : {}]}>
      <View style={{flexDirection: 'row'}}>
        <View style={[styles.payload]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[baseStyles.textStyle.bold, baseStyles.textSize.l]}>
              {survey.props?.labels?.[survey?.props?.languages?.[0]]}
            </Text>
          </View>

          <Text
            style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
            {survey?.props?.name}
          </Text>
          <Text
            style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
            Server: {survey?.serverUrl || currentServerUrl}
          </Text>

          <CreatedAndModified
            dateCreated={survey?.dateCreated}
            dateModified={survey?.dateModified}
          />
          {surveysOrigin === 'remote' && <SurveyStatus survey={survey} />}
        </View>
        <View style={[styles.moreInfo]}>
          <View style={{alignItems: 'flex-end'}}>
            {isLocalSurvey ? (
              <CurrentItemLabel label={t('Surveys:active_survey')} />
            ) : (
              <View />
            )}
            {survey?.isInDevice ? (
              <Icon name="cellphone" size={24} />
            ) : (
              <Icon name="cloud-outline" size={24} />
            )}
          </View>
        </View>
      </View>

      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'row',

            padding: 0,
          }}>
          <Button
            type="ghostBlack"
            label={t('Surveys:selected_survey_panel.more_actions')}
            onPress={handlePress}
            customContainerStyle={{
              paddingLeft: 0,
            }}
            customTextStyle={{
              textAlign: 'left',
            }}
          />
        </View>
        <ActionButton survey={survey} />
      </View>
    </TouchableCard>
  );
};

export default SurveyCard;
