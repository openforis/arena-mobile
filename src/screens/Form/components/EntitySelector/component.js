import React, {useRef, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Animated,
  ScrollView,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useDispatch, useSelector} from 'react-redux';

import BackgroundPattern from 'arena-mobile-ui/components/BackgroundPattern';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import ToggleShowNames from 'arena-mobile-ui/components/ToggleShowNames';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import ListOfErrors from '../ValidationReport/components/ListOfErrors';
import ShowNumberOfErrors from '../ValidationReport/components/ShowNumberOfErrors';

import EntitySelectorTree from './components/EntitySelectorTree';
import _styles from './styles';

const {width: WIDTH} = Dimensions.get('screen');

export const ENTITY_SELECTOR_TABLET_WIDTH = Math.min(
  Math.min(WIDTH * 0.9, 400),
  WIDTH * 0.5,
);

const RootNodeDefLabel = () => {
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);
  const nodeDeflabel = useNodeDefNameOrLabel({nodeDef: nodeDefRoot});
  return <TextBase type="ghostBlack">Root: {nodeDeflabel}</TextBase>;
};

const EntitySelector = () => {
  const [showNavigation, setShowNavigation] = React.useState(true);
  const styles = useThemedStyles(_styles);
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

  useEffect(() => {
    if (isEntitySelectorOpened) {
      setShowNavigation(true);
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
        <Pressable
          onPress={() => setShowNavigation(!showNavigation)}
          style={styles.pressableHeader}>
          <Icon name={showNavigation ? 'chevron-down' : 'chevron-right'} />
          <TextBase>{t('Form:navigation')}</TextBase>
        </Pressable>
        {showNavigation && (
          <ScrollView style={styles.scrollContainer}>
            {isEntitySelectorOpened && (
              <EntitySelectorTree nodeDefUuid={nodeDefRoot?.uuid} />
            )}
          </ScrollView>
        )}
        <Pressable
          onPress={() => setShowNavigation(false)}
          style={styles.pressableHeader}>
          <Icon name={!showNavigation ? 'chevron-down' : 'chevron-right'} />
          <View style={styles.headerText}>
            <TextBase>{t('Form:validation_report')}</TextBase>
            <RootNodeDefLabel />
          </View>
          <ShowNumberOfErrors />
        </Pressable>
        {!showNavigation && (
          <ScrollView style={styles.scrollContainer}>
            {isEntitySelectorOpened && <ListOfErrors />}
          </ScrollView>
        )}
        <View style={styles.buttonsContainer}>
          <Button
            label={t('Form:leave_form_to_record_list_cta')}
            type="ghost"
            onPress={handleLeave}
          />
          <View>
            <ToggleShowNames />
          </View>
        </View>
        <BackgroundPattern />
      </Animated.View>
      {isEntitySelectorOpened && !isTablet() && (
        <TouchableOpacity onPress={handleClose} style={styles.closer} />
      )}
    </>
  );
};

export default EntitySelector;
