import React from 'react';
import {View, Text} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import Navigation from './Navigation';
import styles from './styles';

const SHOW_TREE_BUTTON = false;

const EntityPanel = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );

  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, parentEntityNode),
  );

  return (
    <View
      style={[
        styles.container,
        isTablet() && isEntitySelectorOpened
          ? styles.containerTabletMenuOpen
          : {},
      ]}>
      <View style={styles.header}>
        {SHOW_TREE_BUTTON && (
          <EntitySelectorToggler customStyle={[styles.navigationBottom]} />
        )}
        <View>
          <Text style={[styles.headerTextInfo]}>Current page:</Text>
          <Text style={[styles.headerText]}>
            {label} [{keys}]
          </Text>
        </View>
      </View>
      <Navigation />
    </View>
  );
};

export default EntityPanel;
