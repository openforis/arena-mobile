import React from 'react';
import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const CurrentItemLabel = ({label}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
      <TextBase type="secondary" size="s" customStyle={styles.text}>
        {label}
      </TextBase>
    </View>
  );
};

export default CurrentItemLabel;
