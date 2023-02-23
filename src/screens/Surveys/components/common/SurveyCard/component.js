import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import Icon from 'arena-mobile-ui/components/Icon';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as appSelectors} from 'state/app';

import Actions from './Actions';
import styles from './styles';
import SurveyStatus from './SurveyStatus';

/*
 const handlePress = useCallback(() => {
    onSelect?.(survey);
  }, [survey, onSelect]);
  */
const SurveyCard = ({survey, onSelect, isLocalSurvey, surveysOrigin}) => {
  const {t} = useTranslation();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);

  return (
    <TouchableCard
      customStyles={[styles.container, isLocalSurvey ? styles.selected : {}]}>
      <View style={styles.infoContainer}>
        <View style={[styles.payload]}>
          <View style={styles.labelCotainer}>
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

            <Icon
              name={survey?.isInDevice ? 'cellphone' : 'cloud-outline'}
              size={24}
            />
          </View>
        </View>
      </View>

      <Actions survey={survey} onSelect={onSelect} />
    </TouchableCard>
  );
};

export default SurveyCard;
