import * as React from 'react';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import Card from 'arena-mobile-ui/components/Card';

import styles from './styles';

const EmptyBlock = ({title, info, ctaLabel, onPress}) => {
  return (
    <Card customStyles={styles.container}>
      <TextTitle>{title}</TextTitle>

      <TextBase size="xl">{info}</TextBase>

      <View style={[styles.buttonContainer]}>
        <Button type="ghost" label={ctaLabel} onPress={onPress} />
      </View>
    </Card>
  );
};

export default EmptyBlock;
