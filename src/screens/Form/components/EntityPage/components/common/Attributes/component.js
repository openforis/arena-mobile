import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';

import _styles from './styles';

const Footer = () => {
  const styles = useThemedStyles(_styles);
  return <View style={[styles.block]} />;
};

const Attributes = () => {
  const styles = useThemedStyles(_styles);

  const nodeDefChildrenUuids = useSelector(
    formSelectors.getFormAttributesNodeDefsUuids,
  );

  const renderItem = useCallback(
    ({item: nodeDefUuid}) => <Attribute nodeDefUuid={nodeDefUuid} />,
    [],
  );

  const keyExtractor = useCallback(key => key, []);

  const flatListRef = useRef();

  const toTop = useCallback(() => {
    flatListRef.current.scrollToOffset({animated: false, offset: 0});
  }, [flatListRef]);

  useEffect(() => {
    toTop();
  }, [toTop, nodeDefChildrenUuids]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        data={nodeDefChildrenUuids}
        ListFooterComponent={Footer}
        initialNumToRender={Math.min(nodeDefChildrenUuids.length, 6)}
      />
    </View>
  );
};

export default Attributes;
