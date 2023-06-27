import React, {useCallback, useRef} from 'react';
import {View, FlatList} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';

import BreadCrumb from './components/BreadCrumb';
import EntitySelectorToggler from './components/EntitySelectorToggler';
import _styles from './styles';

const BreadCrumbsList = () => {
  const breadCrumbs = useSelector(formSelectors.getBreadCrumbs);
  const styles = useThemedStyles(_styles);
  const scrollViewRef = useRef();

  const onContentSizeChange = useCallback(() => {
    scrollViewRef.current.scrollToEnd({animated: true});
  }, [scrollViewRef]);

  const renderItem = useCallback(({item}) => <BreadCrumb node={item} />, []);

  const keyExtractor = useCallback(item => item.uuid, []);

  return (
    <FlatList
      horizontal={true}
      contentContainerStyle={styles.breadCrumbsList}
      ref={scrollViewRef}
      initialNumToRender={3}
      data={breadCrumbs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onContentSizeChange={onContentSizeChange}
    />
  );
};
const BreadCrumbs = () => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={styles.container}>
      <View style={styles.entitySelectorButton}>
        <EntitySelectorToggler />
      </View>

      <BreadCrumbsList />
    </View>
  );
};

export default BreadCrumbs;
