import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useIsTable} from 'screens/Form/components/EntityPage/components/common/EntityPanel/NewItemButton/component';
import {selectors as formSelectors} from 'state/form';

import AutomaticallyStoredInfo from './AutomaticallyStoredInfo';
import CurrentPageInfo from './CurrentPageInfo';
import MultipleEntityOptions from './MultipleEntityOptions';
import Navigation from './Navigation';
import {useGetHasNavigation} from './Navigation/component';
import _styles from './styles';
import TableOption from './TableOption';

const MULTILEVEL_COLLAPSE = true;

const EntityPanel = () => {
  const [collapseLevel, setCollapseLevel] = React.useState(0);
  const hasNavigation = useGetHasNavigation();
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const styles = useThemedStyles(_styles);
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const showMultipleEntityHome = useSelector(
    formSelectors.showMultipleEntityHome,
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
      StyleSheet.compose(
        collapseLevel === 1 ? styles.containerCollapsed : {},
        collapseLevel === 2 ? styles.containerCollapsedSuper : {},
      ),
    );
  }, [styles, _isTablet, isEntitySelectorOpened, collapseLevel]);

  useEffect(() => {
    if (!hasNavigation && collapseLevel === 1) {
      setCollapseLevel(2);
    }
  }, [hasNavigation, collapseLevel]);
  return (
    <View style={panelContainer}>
      <View style={styles.collapseButtonContainer}>
        <TouchableIcon
          customStyle={styles.collapseButton}
          iconName={collapseLevel === 2 ? 'chevron-up' : 'chevron-down'}
          onPress={() =>
            setCollapseLevel(
              MULTILEVEL_COLLAPSE && hasNavigation
                ? (collapseLevel + 1) % 3
                : collapseLevel === 2
                  ? 0
                  : 2,
            )
          }
          hitSlop={{
            top: 0,
            right: 80,
            bottom: 20,
            left: 80,
          }}
        />
      </View>
      {collapseLevel === 0 && (
        <>
          <View style={styles.header}>
            <View style={styles.textContainer}>
              <CurrentPageInfo />
              {(isTable || isMultiple) && !showMultipleEntityHome && (
                <TableOption />
              )}
            </View>
            {!showMultipleEntityHome && <MultipleEntityOptions />}
          </View>
        </>
      )}
      {collapseLevel <= 1 && <Navigation />}
      {collapseLevel === 0 && <AutomaticallyStoredInfo />}
    </View>
  );
};

export default EntityPanel;
