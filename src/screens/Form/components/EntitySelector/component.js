import React, {useRef, useEffect} from 'react';
import {Dimensions, Animated, ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';

import ToggleShowNames from 'arena-mobile-ui/components/ToggleShowNames';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import EntitySelectorTree from './components/EntitySelectorTree';
import styles from './styles';

const {width: WIDTH} = Dimensions.get('screen');

const EntitySelector = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);

  const panelWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEntitySelectorOpened) {
      const finalPanerWidth = WIDTH * 0.9;
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(panelWidth, {
          toValue: finalPanerWidth,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(panelWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isEntitySelectorOpened]);

  return (
    <Animated.View style={[styles.container, {width: panelWidth}]}>
      <ScrollView style={[styles.scrollContainer]}>
        <EntitySelectorTree nodeDef={nodeDefRoot} />
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <ToggleShowNames />
      </View>
    </Animated.View>
  );
};

export default EntitySelector;
