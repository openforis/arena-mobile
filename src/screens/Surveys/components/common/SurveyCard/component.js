import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';

import ActualItem from 'arena-mobile-ui/components/ActualItem';
import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';

import StatusInfo from './StatusInfo';
import styles from './styles';

const SurveyCard = ({
  survey,
  onSelect,
  isSelected,
  isLocalSurvey,
  showIcons,
}) => {
  const handlePress = useCallback(() => {
    onSelect?.(survey);
  }, [survey, onSelect]);
  const {t} = useTranslation();
  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View>
        <Text style={[baseStyles.textStyle.bold, baseStyles.textSize.l]}>
          {survey.props.labels?.[survey?.props?.languages?.[0]]}
        </Text>
        <Text
          style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
          {survey?.props?.name}
        </Text>

        <CreatedAndModified
          dateCreated={survey?.dateCreated}
          dateModified={survey?.dateModified}
        />
      </View>
      <View style={[styles.moreInfo]}>
        {isLocalSurvey ? (
          <ActualItem label={t('Surveys:actual_survey')} />
        ) : (
          <View />
        )}

        {showIcons && (
          <View>
            <StatusInfo survey={survey} />
          </View>
        )}
      </View>
    </TouchableCard>
  );
};

export default SurveyCard;
