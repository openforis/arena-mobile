import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors} from 'state/app';

import Actions from './Actions';
import _styles from './styles';
import SurveyStatus from './SurveyStatus';
import VisualDescription from 'screens/Home/components/Survey/components/VisualDescription';

const SurveyCard = ({
  survey,
  onSelect,
  isLocalSurvey,
  surveysOrigin,
  errorRemoteServer,
}) => {
  const {t} = useTranslation();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const styles = useThemedStyles(_styles);
  const surveyLabel = useMemo(() => {
    return survey?.props?.labels?.[survey?.props?.languages?.[0]] || '';
  }, [survey]);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      isLocalSurvey ? styles.selected : {},
    );
  }, [styles, isLocalSurvey]);

  return (
    <TouchableCard customStyles={containerStyle}>
      <View style={styles.infoContainer}>
        <View style={styles.payload}>
          <View style={styles.visualDescriptionContainer}>
            <VisualDescription
              surveyLabel={surveyLabel}
              visualDescription={survey?.props?.visualDescription}
            />
          </View>
          <View>
            <View style={styles.labelContainer}>
              <TextBase type="bold" size="l">
                {surveyLabel}
              </TextBase>
            </View>

            <TextBase type="secondary" size="s">
              {survey?.props?.name}
            </TextBase>
            <TextBase type="secondary" size="xs">
              {t('Common:server')}: {survey?.serverUrl || currentServerUrl}
            </TextBase>

            <CreatedAndModified
              dateCreated={survey?.dateCreated}
              dateModified={survey?.dateModified}
            />
            {surveysOrigin === 'remote' && !errorRemoteServer && (
              <SurveyStatus survey={survey} />
            )}
          </View>
        </View>
        <View style={styles.moreInfo}>
          <View style={styles.activeSurveyContainer}>
            {isLocalSurvey ? (
              <CurrentItemLabel label={t('Surveys:active_survey')} />
            ) : (
              <View />
            )}

            <Icon
              name={survey?.isInDevice ? 'cellphone' : 'cloud-outline'}
              size="m"
            />
          </View>
        </View>
      </View>

      <Actions survey={survey} onSelect={onSelect} />
    </TouchableCard>
  );
};

export default SurveyCard;
