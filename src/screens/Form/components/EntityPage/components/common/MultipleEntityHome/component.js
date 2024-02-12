import React from 'react';
import {View} from 'react-native';

import NewItemButton from '../EntityPanel/NewItemButton';
import {Table} from '../../TableEntity';
import _styles from './styles';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

const Header = () => {
  const styles = useThemedStyles(_styles);
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
        <Table onlyKeys={true} />
      </View>
    </View>
  );
};

export default MultipleEntityHome;
