import React from 'react';
import {View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import {SORTERS} from './config';
import styles from './styles';

const Sorter = ({sortCriteriaIndex, setSortCriteriaIndex}) => {
  return (
    <View style={styles.container}>
      <TouchableIcon
        iconName={SORTERS[sortCriteriaIndex].icon}
        hitSlop={baseStyles.bases.BASE_16}
        onPress={() =>
          setSortCriteriaIndex((sortCriteriaIndex + 1) % SORTERS.length)
        }
      />
    </View>
  );
};
export default Sorter;
