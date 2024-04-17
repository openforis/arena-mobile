import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {NodeDefs} from '@openforis/arena-core';

import NewItemButton from '../EntityPanel/NewItemButton';
import {Table} from '../../TableEntity';
import _styles from './styles';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import formSelectors from 'state/form/selectors';

const Header = () => {
  const styles = useThemedStyles(_styles);
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (NodeDefs.isEnumerate(parentEntityNodeDef)) {
    return;
  }

  return (
    <View style={styles.header}>
      <NewItemButton
        visible={true}
        customContainerStyle={styles.newItemsButton}
        checkKeys={false}
        styleTheme="neutral"
        showNodeDefLabel={true}
      />
    </View>
  );
};
const MultipleEntityHome = () => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.tableContainer}>
        <Table onlyKeys={true} onlyIncludedInMultipleEntitySummary={true} />
      </View>
    </View>
  );
};

export default MultipleEntityHome;
