import React from 'react';
import {ImageBackground} from 'react-native';

import useThemedStyles, {
  useColorTheme,
} from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const backgroundImages = {
  light: require('./tile.png'),
  dark: require('./tile_less_dark.png'),
};
const EntitySelector = () => {
  const theme = useColorTheme();
  const styles = useThemedStyles(_styles);

  return (
    <ImageBackground
      source={backgroundImages[theme] || backgroundImages.light}
      resizeMode="repeat"
      style={styles.imageContainer}
    />
  );
};

export default EntitySelector;
