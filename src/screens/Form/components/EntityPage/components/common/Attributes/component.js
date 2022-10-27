import React, {useCallback} from 'react';
import {FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';

import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import MultipleEntityFooter from '../MultipleEntityFooter';

import styles from './styles';

const Footer = () => {
  return (
    <View style={[styles.block]}>
      <MultipleEntityFooter />
    </View>
  );
};

const Attributes = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const layoutNodeDefChildrenUuids = (
    nodeDef.props.layout[cycle]?.layoutChildren || []
  ).map(children => (typeof children === 'string' ? children : children.i));

  const computedNodeDefChildrenUuids = useSelector(state =>
    surveySelectors.getNodeDefEntityChildrenAttributesUuids(state, nodeDef),
  );

  const nodeDefChildrenUuids = Array.from(
    new Set(
      (layoutNodeDefChildrenUuids || []).concat(computedNodeDefChildrenUuids),
    ),
  );
  const renderItem = useCallback(
    ({item: nodeDefUuid}) => <Attribute nodeDefUuid={nodeDefUuid} />,
    [],
  );

  const keyExtractor = useCallback(key => key, []);

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        data={nodeDefChildrenUuids}
        ListFooterComponent={Footer}
      />
    </View>
  );
};

export default Attributes;
