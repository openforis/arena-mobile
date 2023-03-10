import React from 'react';
import {View} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {useIsTable} from 'screens/Form/components/EntityPage/components/common/EntityPanel/NewItemButton/component';
import {selectors as formSelectors} from 'state/form';

import AutomaticallyStoredInfo from './AutomaticallyStoredInfo';
import CurrentPageInfo from './CurrentPageInfo';
import MultipleEntityOptions from './MultipleEntityOptions';
import Navigation from './Navigation';
import styles from './styles';
import TableOption from './TableOption';

const SHOW_TREE_BUTTON = false;

const EntityPanel = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const isTable = useIsTable();

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
        <View style={styles.textContainer}>
          <CurrentPageInfo />
          {isTable && <TableOption />}
        </View>
        <MultipleEntityOptions />
      </View>
      <Navigation />
      <AutomaticallyStoredInfo />
    </View>
  );
};

export default EntityPanel;
