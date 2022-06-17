import React, {useRef, useEffect} from 'react';
import {View, Text, Dimensions, Animated} from 'react-native';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import styles from './styles';

const {width} = Dimensions.get('screen');

const ProgressBar = () => {
  const isUploading = useSelector(surveySelectors.getIsUploading);
  const uploadProgress = useSelector(surveySelectors.getUploadProgress);

  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: (uploadProgress * width) / 100,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress, barWidth]);

  useEffect(() => {
    if (!isUploading) {
      Animated.timing(barWidth, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [isUploading, barWidth]);

  if (!isUploading) {
    return <></>;
  }
  return (
    <View style={styles.barContainer}>
      <View style={styles.background}>
        <Animated.View style={[styles.backgroundProgress, {width: barWidth}]} />
        <Text style={styles.progress}>{uploadProgress}/100 </Text>
      </View>
    </View>
  );
};

export default ProgressBar;
