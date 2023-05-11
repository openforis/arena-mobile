import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import Button from 'arena-mobile-ui/components/Button';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import _styles from './styles';

const Empty = ({title, info, ctaLabel, onPress}) => {
  const styles = useThemedStyles({styles: _styles});
  return (
    <View style={styles.container}>
      <View>
        <TextTitle>{title}</TextTitle>
        <TextBase size="xl" customStyle={styles.info}>
          {info}
        </TextBase>
      </View>

      <Button type="primary" label={ctaLabel} onPress={onPress} />
    </View>
  );
};

export default Empty;
