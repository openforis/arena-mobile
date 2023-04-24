import React from 'react';
import {View, Text} from 'react-native';

import {useTranslation} from 'react-i18next';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import {SORTERS} from './config';
import styles from './styles';

const Sorter = ({sortCriteriaIndex, setSortCriteriaIndex}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('Common:sort_by')}</Text>

      <TouchableIcon
        iconName={SORTERS[sortCriteriaIndex].icon}
        hitSlop={baseStyles.bases.BASE_8}
        customStyle={styles.icon}
        onPress={() =>
          setSortCriteriaIndex((sortCriteriaIndex + 1) % SORTERS.length)
        }
      />
    </View>
  );
};
export default Sorter;
