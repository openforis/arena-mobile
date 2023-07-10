import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
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

  return (
    <TouchableCard
      customStyles={[styles.container, isLocalSurvey ? styles.selected : {}]}>
      <View style={styles.infoContainer}>
        <View style={styles.payload}>
          <View style={styles.labelCotainer}>
            <TextBase type="bold" size="l">
              {survey.props?.labels?.[survey?.props?.languages?.[0]]}
            </TextBase>
          </View>

          <TextBase type="secondary" size="s">
            {survey?.props?.name}
          </TextBase>
          <TextBase type="secondary" size="s">
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
        <View style={styles.moreInfo}>
          <View style={{alignItems: 'flex-end'}}>
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
