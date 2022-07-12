import moment from 'moment-timezone';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';

import baseStyles from '../../styles';

import styles from './styles';

const Label = ({label}) => (
  <Text
    style={[
      baseStyles.textStyle.secondaryText,
      baseStyles.textStyle.bold,
      baseStyles.textSize.s,
    ]}>
    {label}
  </Text>
);

const Date = ({label}) => (
  <Text style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
    {label}
  </Text>
);

const CreatedAndModified = ({dateCreated, dateModified}) => {
  const {t} = useTranslation();
  return (
    <View style={[styles.container]}>
      <View style={[styles.titles]}>
        <Label label={t('Common:created')} />
        <Label label={t('Common:modified')} />
      </View>
      <View>
        <Date label={moment(dateCreated).fromNow()} />
        <Date label={moment(dateModified).fromNow()} />
      </View>
    </View>
  );
};

export default CreatedAndModified;
