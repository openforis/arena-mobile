import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {useIsTable} from 'screens/Form/components/EntityPage/components/common/EntityPanel/NewItemButton/component';
import {selectors as formSelectors} from 'state/form';

import AutomaticallyStoredInfo from './AutomaticallyStoredInfo';
import CurrentPageInfo from './CurrentPageInfo';
import MultipleEntityOptions from './MultipleEntityOptions';
import Navigation from './Navigation';
import _styles from './styles';
import TableOption from './TableOption';

const SHOW_TREE_BUTTON = false;

const EntityPanel = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const styles = useThemedStyles(_styles);
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const isTable = useIsTable();
  const _isTablet = isTablet();
  const isMultiple = useMemo(() => NodeDefs.isMultiple(nodeDef), [nodeDef]);

  const panelContainer = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(
        styles.container,
        _isTablet && isEntitySelectorOpened
          ? styles.containerTabletMenuOpen
          : {},
      ),
      isCollapsed ? styles.containerCollapsed : {},
    );
  }, [styles, _isTablet, isEntitySelectorOpened, isCollapsed]);

  return (
    <View style={panelContainer}>
      <View style={styles.collapseButtonContainer}>
        <TouchableIcon
          customStyle={styles.collapseButton}
          iconName={isCollapsed ? 'chevron-up' : 'chevron-down'}
          onPress={() => setIsCollapsed(!isCollapsed)}
          hitSlop={40}
        />
      </View>
      {!isCollapsed && (
        <>
          <View style={styles.header}>
            {SHOW_TREE_BUTTON && (
              <EntitySelectorToggler customStyle={styles.navigationBottom} />
            )}
            <View style={styles.textContainer}>
              <CurrentPageInfo />
              {(isTable || isMultiple) && <TableOption />}
            </View>
            <MultipleEntityOptions />
          </View>
          <Navigation />
          <AutomaticallyStoredInfo />
        </>
      )}
    </View>
  );
};

export default EntityPanel;
