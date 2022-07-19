import React, {useRef, useEffect, useCallback} from 'react';
import {
  Dimensions,
  Animated,
  ScrollView,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import ToggleShowNames from 'arena-mobile-ui/components/ToggleShowNames';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import EntitySelectorTree from './components/EntitySelectorTree';
import styles from './styles';

const {width: WIDTH} = Dimensions.get('screen');

const EntitySelector = () => {
  const {navigateTo, routes} = useNavigateTo();

  const dispatch = useDispatch();

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

  const handleClose = useCallback(() => {
    dispatch(formActions.closeEntitySelector());
  }, [dispatch]);

  const handleNavigateToHome = useCallback(() => {
    handleClose();
    navigateTo({route: routes.HOME})();
  }, [navigateTo, dispatch]);

  return (
    <>
      <Animated.View style={[styles.container, {width: panelWidth}]}>
        <ScrollView style={[styles.scrollContainer]}>
          <EntitySelectorTree nodeDef={nodeDefRoot} />
        </ScrollView>
        <View style={styles.buttonsContainer}>
          <Button title="home" onPress={handleNavigateToHome} />
          <ToggleShowNames />
        </View>
      </Animated.View>
      {isEntitySelectorOpened && (
        <TouchableOpacity onPress={handleClose} style={styles.closer} />
      )}
    </>
  );
};

export default EntitySelector;
