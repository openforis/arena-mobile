import React, {useCallback} from 'react';
import {Pressable, View, FlatList} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import {selectors as formSelectors, actions as formActions} from 'state/form';

import {useDispatch, useSelector} from 'react-redux';

import _styles from './styles';

const _labelExtractor = item => item?.keyString || '-';
const EntityNode = ({item, onPress}) => {
  return (
    <Pressable style={{backgroundColor: 'red', height: 50}} onPress={onPress}>
      <TextBase>{_labelExtractor(item)}</TextBase>
    </Pressable>
  );
};

const keyExtractor = item => item.uuid;

const MultipleEntityHome = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const entityNodes = useSelector(state =>
    formSelectors.getNodeDefNodesWithKeysAsStringInHierarchy(
      state,
      parentEntityNodeDef,
    ),
  );

  const dispatch = useDispatch();

  const handleSelectEntityNode = useCallback(
    node => () => {
      if (node) {
        dispatch(
          formActions.selectEntityNode({
            node,
          }),
        );
      }
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({item}) => (
      <EntityNode item={item} onPress={handleSelectEntityNode(item)} />
    ),
    [handleSelectEntityNode],
  );

  return (
    <View
      style={{
        backgroundColor: 'blue',
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 100,
      }}>
      <TextBase size="s">
        {parentEntityNodeDef.uuid}
        {parentEntityNodeDef.props.name}
        {entityNodes.length}
      </TextBase>
      <View style={{flexDirection: 'row'}}>
        <FlatList
          data={entityNodes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </View>
  );
};

export default MultipleEntityHome;
