import React, {useRef, useEffect} from 'react';
import {Dimensions, Animated, ScrollView, View, Button} from 'react-native';
import {useSelector} from 'react-redux';

import ToggleShowNames from 'arena-mobile-ui/components/ToggleShowNames';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import EntitySelectorTree from './components/EntitySelectorTree';
import styles from './styles';
const {width: WIDTH} = Dimensions.get('screen');

const EntitySelector = () => {
  const {navigateTo, routes} = useNavigateTo();

  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);

  const panelWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEntitySelectorOpened) {
      const finalPanerWidth = WIDTH * 0.9;

      Animated.timing(panelWidth, {
        toValue: finalPanerWidth,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(panelWidth, {
        toValue: 0,
        duration: 100,
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
        <Button title="home" onPress={navigateTo({route: routes.HOME})} />
        <ToggleShowNames />
      </View>
    </Animated.View>
  );
};

export default EntitySelector;
