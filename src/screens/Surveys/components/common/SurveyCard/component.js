import React, {useCallback} from 'react';
import {View, Text} from 'react-native';

import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const SurveyCard = ({survey, onSelect, isSelected}) => {
  const handlePress = useCallback(() => {
    onSelect?.(survey);
  }, [survey, onSelect]);

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View>
        <Text>
          {survey.id} - {survey?.name}
        </Text>
        <Text style={[baseStyles.textStyle.bold]}>
          {survey.props.labels?.[survey?.props?.languages?.[0]]}
        </Text>
        <Text>{survey.status}</Text>
      </View>
    </TouchableCard>
  );
};

export default SurveyCard;
