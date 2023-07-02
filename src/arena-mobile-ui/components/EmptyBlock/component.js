import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';

import styles from './styles';

const EmptyBlock = ({
  title,
  info,
  ctaLabel,
  onPress,
  buttonType,
  buttonWidth,
}) => {
  const customContainerStyle = useMemo(() => {
    return StyleSheet.create(buttonWidth === 'full' ? styles.fullWidth : {});
  }, [buttonWidth]);
  return (
    <Card customStyles={styles.container}>
      <TextTitle>{title}</TextTitle>

      <TextBase size="xl">{info}</TextBase>

      <View style={styles.buttonContainer}>
        <Button
          type={buttonType}
          label={ctaLabel}
          onPress={onPress}
          customContainerStyle={customContainerStyle}
        />
      </View>
    </Card>
  );
};

EmptyBlock.defaultProps = {
  title: '',
  info: '',
  ctaLabel: '',
  onPress: () => {},
  buttonType: 'ghost',
  buttonWidth: 'normal',
};

export default EmptyBlock;
