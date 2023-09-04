import React, {useRef, useEffect} from 'react';
import {View, Dimensions, Animated} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const {width} = Dimensions.get('screen');

const ProgressBar = ({progress, success, info, maxWidth, height, main}) => {
  const styles = useThemedStyles(_styles);
  const barWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: (Math.max(10, progress) * maxWidth) / 100,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.barContainer, {height}]}>
      <View
        style={[
          styles.background,
          {
            height,
            width: maxWidth,

            backgroundColor:
              main || success || info
                ? styles.colors.neutralLight
                : styles.colors.errorLight,
          },
        ]}>
        <Animated.View
          style={[
            styles.backgroundProgress,
            {
              height,
              width: barWidth,
              backgroundColor: info
                ? styles.colors.secondary
                : success
                ? styles.colors.success
                : styles.colors.error,
            },
          ]}
        />
      </View>
    </View>
  );
};

ProgressBar.defaultProps = {
  progress: 0,
  success: true,
  info: false,
  maxWidth: width - 24,
  height: 4,
  main: false,
};

export default ProgressBar;
