import React, {useRef, useEffect} from 'react';
import {View, Animated} from 'react-native';

import styles from './styles';

const useSkeletonAnimation = () => {
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,

          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 400,

          useNativeDriver: true,
        }),
      ]),

      {iterations: 1000},
    ).start();
  }, [opacityAnim]);

  return opacityAnim;
};

const Loading = () => {
  const opacityAnim = useSkeletonAnimation();

  return (
    <View style={[styles.container]}>
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
      <Animated.View style={[styles.item, {opacity: opacityAnim}]} />
    </View>
  );
};

export default Loading;
