import React, {useRef, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Animated,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ToggleShowNames from 'arena-mobile-ui/components/ToggleShowNames';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import EntitySelectorTree from './components/EntitySelectorTree';
import styles from './styles';

const {width: WIDTH} = Dimensions.get('screen');

export const ENTITY_SELECTOR_TABLET_WIDTH = Math.min(
  Math.min(WIDTH * 0.9, 400),
  WIDTH * 0.5,
);

const EntitySelector = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();

  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);

  const panelWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEntitySelectorOpened) {
      const finalPanelWidth = isTablet()
        ? ENTITY_SELECTOR_TABLET_WIDTH
        : WIDTH * 0.9;

      Animated.timing(panelWidth, {
        toValue: finalPanelWidth,
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

  const handleLeave = useCallback(() => {
    dispatch(formActions.leaveForm());
  }, [dispatch]);

  return (
    <>
      <Animated.View style={[styles.container, {width: panelWidth}]}>
        <ScrollView style={[styles.scrollContainer]}>
          <EntitySelectorTree nodeDefUuid={nodeDefRoot?.uuid} />
        </ScrollView>
        <View style={styles.buttonsContainer}>
          <Button
            label={t('Form:leave_form_to_record_list_cta')}
            type="ghost"
            onPress={handleLeave}
          />
          <ToggleShowNames />
        </View>
      </Animated.View>
      {isEntitySelectorOpened && !isTablet() && (
        <TouchableOpacity onPress={handleClose} style={styles.closer} />
      )}
    </>
  );
};

export default EntitySelector;
