import React, {useCallback, useEffect, useRef, useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';

import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const Attributes = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const computedNodeDefChildrenUuids = useSelector(state =>
    surveySelectors.getNodeDefEntityChildrenAttributesUuids(state, nodeDef),
  );

  const nodeDefChildrenUuids = useMemo(() => {
    const layoutNodeDefChildrenUuids = (
      nodeDef.props.layout[cycle]?.layoutChildren || []
    ).map(children => (typeof children === 'string' ? children : children.i));

    return Array.from(
      new Set(
        (layoutNodeDefChildrenUuids || []).concat(computedNodeDefChildrenUuids),
      ),
    );
  }, [nodeDef, cycle, computedNodeDefChildrenUuids]);

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
      />
    </View>
  );
};

export default Attributes;
