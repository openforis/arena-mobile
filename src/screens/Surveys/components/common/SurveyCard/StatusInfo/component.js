import {Objects} from '@openforis/arena-core';
import moment from 'moment-timezone';
import React, {useRef, useEffect, useState} from 'react';
import {View, Animated} from 'react-native';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveysSelectors} from 'state/surveys';

import styles from './styles';

const statusConfig = {
  toDownload: {
    icon: 'cloud-download-outline',
    color: colors.alert,
  },
  toUpdate: {
    icon: 'refresh-outline',
    color: colors.alert,
  },
  ready: {
    icon: 'cloud-done-outline',
    color: colors.success,
  },
};

const StatusInfo = ({survey}) => {
  const isLoading = useSelector(surveysSelectors.getIsLoading);
  const localSurvey = useSelector(state =>
    surveysSelectors.getSurveyByUuid(state, {surveyUuid: survey.uuid}),
  );
  const size = useRef(new Animated.Value(5)).current;
  const [status, setStatus] = useState(null);

  const blinkAnimation = useRef(
    Animated.loop(
      Animated.sequence([
        Animated.timing(size, {
          toValue: 8,
          duration: 400,

          useNativeDriver: false,
        }),
        Animated.timing(size, {
          toValue: 3,
          duration: 400,

          useNativeDriver: false,
        }),
      ]),

      {iterations: 1000},
    ),
  ).current;

  useEffect(() => {
    if (survey.id === isLoading) {
      blinkAnimation.start();
    }

    //
  }, [survey, blinkAnimation, isLoading]);

  useEffect(() => {
    if (Objects.isEmpty(localSurvey)) {
      setStatus('toDownload');
    } else {
      const isOutdated =
        moment(localSurvey.dateModified).diff(moment(survey.dateModified)) !==
        0;

      if (isOutdated) {
        setStatus('toUpdate');
      } else {
        setStatus('ready');
      }
      blinkAnimation.stop();
      size.setValue(5);
    }
  }, [size, blinkAnimation, survey, localSurvey]);

  if (!status) {
    return <View />;
  }
  return (
    <View style={[styles.container]}>
      <View style={[styles.dotContainer]}>
        <Animated.View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: statusConfig[status].color,
            },
          ]}
        />
      </View>

      <Icon name={statusConfig[status].icon} size={baseStyles.fontSizes.l} />
    </View>
  );
};

export default StatusInfo;
