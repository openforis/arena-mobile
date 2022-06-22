import React, {useCallback, useState, useRef, useEffect} from 'react';
import {
  Dimensions,
  Animated,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Tooltip} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {select} from 'redux-saga/effects';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

const {height: HEIGHT} = Dimensions.get('screen');

import styles from './styles';

const Validation = ({nodeDef}) => {
  return (
    <View>
      <Tooltip
        backgroundColor={colors.error}
        overlayColor={colors.transparent}
        popover={<Text>Info here</Text>}>
        <Icon name="warning-outline" color={colors.error} />
      </Tooltip>
    </View>
  );
};

export default Validation;
