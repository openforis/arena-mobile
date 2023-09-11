import React, {useCallback, useEffect, useState, useRef} from 'react';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';

import {useAttributesUuids} from '../hooks';

import _styles from './styles';

const Footer = () => {
  const styles = useThemedStyles(_styles);
  return <View style={styles.block} />;
};

const Header = () => {
  const styles = useThemedStyles(_styles);
  return <View style={styles.headerBlock} />;
};

const Attributes = React.memo(
  ({nodeDefChildrenUuids}) => {
    const styles = useThemedStyles(_styles);
    const [currentParentEntityNodeUuid, setCurrentParentEntityNodeUuid] =
      useState(null);

    const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

    const renderItem = useCallback(
      ({item: nodeDefUuid}) => (
        <Attribute key={nodeDefUuid} nodeDefUuid={nodeDefUuid} />
      ),
      [],
    );

    const keyExtractor = useCallback(key => key, []);

    const flatListRef = useRef();

    const toTop = useCallback(() => {
      flatListRef.current.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef]);

    useEffect(() => {
      if (parentEntityNode.uuid !== currentParentEntityNodeUuid) {
        setCurrentParentEntityNodeUuid(parentEntityNode.uuid);
        toTop();
      }
    }, [toTop, parentEntityNode, currentParentEntityNodeUuid]);

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          data={nodeDefChildrenUuids}
          ListFooterComponent={Footer}
          ListHeaderComponent={Header}
          initialNumToRender={6}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.nodeDefChildrenUuids === nextProps.nodeDefChildrenUuids;
  },
);

const AttributesContainer = () => {
  const styles = useThemedStyles(_styles);
  const nodeDefChildrenUuids = useAttributesUuids();

  return (
    <View style={styles.container}>
      <Attributes nodeDefChildrenUuids={nodeDefChildrenUuids} />
    </View>
  );
};
export default AttributesContainer;
