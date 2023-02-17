import React from 'react';
import {View, Text} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import {SORTERS} from './config';
import styles from './styles';

const Sorter = ({sortCriteriaIndex, setSortCriteriaIndex}) => {
  return (
    <View style={styles.container}>
      <Text style={{marginRight: 8}}>Sort by</Text>
      <TouchableIcon
        iconName={SORTERS[sortCriteriaIndex].icon}
        hitSlop={baseStyles.bases.BASE_8}
        customStyle={{paddingRight: 8}}
        onPress={() =>
          setSortCriteriaIndex((sortCriteriaIndex + 1) % SORTERS.length)
        }
      />
    </View>
  );
};
export default Sorter;
