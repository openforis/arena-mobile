import moment from 'moment-timezone';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';

import baseStyles from '../../styles';

import styles from './styles';

const CreatedAndModified = ({dateCreated, dateModified}) => {
  const {t} = useTranslation();
  return (
    <View style={[styles.container]}>
      <View style={[styles.titles]}>
        <Text
          style={[
            baseStyles.textStyle.secondaryText,
            baseStyles.textStyle.bold,
            baseStyles.textSize.s,
          ]}>
          {t('Common:created')}:
        </Text>
        <Text
          style={[
            baseStyles.textStyle.secondaryText,
            baseStyles.textStyle.bold,
            baseStyles.textSize.s,
          ]}>
          {t('Common:modified')}:
        </Text>
      </View>
      <View>
        <Text
          style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
          {moment(dateCreated).fromNow()}
        </Text>
        <Text
          style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
          {moment(dateModified).fromNow()}
        </Text>
      </View>
    </View>
  );
};

export default CreatedAndModified;
