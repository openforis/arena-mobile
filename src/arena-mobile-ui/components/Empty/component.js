import React from 'react';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Empty = ({title, info, ctaLabel, onPress}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
      <View>
        <TextTitle>{title}</TextTitle>
        <TextBase size="xl" customStyle={styles.info}>
          {info}
        </TextBase>
      </View>

      {ctaLabel && <Button type="primary" label={ctaLabel} onPress={onPress} />}
    </View>
  );
};

Empty.defaultProps = {
  ctaLabel: false,
};

export default Empty;
