import React, {useRef, useEffect} from 'react';
import {View, Dimensions, Animated} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

import styles from './styles';

const {width} = Dimensions.get('screen');

const ProgressBar = ({
  progress,
  success,
  maxWidth = width - 24,
  height = 4,
  main = false,
}) => {
  const barWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: (progress * maxWidth) / 100,
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
              main || success ? colors.neutralLighter : colors.errorLight,
          },
        ]}>
        <Animated.View
          style={[
            styles.backgroundProgress,
            {
              height,
              width: barWidth,
              backgroundColor: success ? colors.success : colors.error,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
