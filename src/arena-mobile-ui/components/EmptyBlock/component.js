import * as React from 'react';
import {View, Text} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const EmptyBlock = ({
  title,
  info,
  ctaLabel,
  onPress,
  buttonType = 'ghost',
  buttonWidth = 'normal',
}) => {
  return (
    <Card customStyles={styles.container}>
      <Text style={[baseStyles.textStyle.title]}>{title}</Text>

      <Text
        style={[
          baseStyles.textStyle.text,
          baseStyles.textSize.xl,
          styles.info,
        ]}>
        {info}
      </Text>

      <View style={[styles.buttonContainer]}>
        <Button
          type={buttonType}
          label={ctaLabel}
          onPress={onPress}
          customContainerStyle={[
            buttonWidth === 'full' ? styles.fullWidth : {},
          ]}
        />
      </View>
    </Card>
  );
};

export default EmptyBlock;
