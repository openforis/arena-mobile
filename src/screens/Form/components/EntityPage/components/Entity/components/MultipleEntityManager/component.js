import React, {useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const MultipleEntityManager = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const sibilingNodes = useSelector(state =>
    formSelectors.getNodeDefNodes(state, parentEntityNodeDef),
  );
  const hierarchyNodesUuids = useSelector(formSelectors.getBreadCrumbs).map(
    h => h.uuid,
  );
  const dispatch = useDispatch();

  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: parentEntityNodeDef,
        node: parentEntityNode,
      }),
    );
  }, [dispatch, parentEntityNodeDef, parentEntityNode]);

  const handleDeleteNode = useCallback(() => {
    dispatch(formActions.deleteNodeEntity({node: parentEntityNode}));
  }, [dispatch, parentEntityNode]);

  const handleSelectEntityNode = useCallback(
    node => {
      dispatch(
        formActions.selectEntityNode({
          node,
        }),
      );
    },
    [dispatch],
  );

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return (
    <>
      <View style={styles.header}>
        <TouchableIcon
          iconName="add-outline"
          onPress={handleCreateNewNodeEntity}
        />
        <Text>{parentEntityNodeDef.props.name}</Text>

        <TouchableIcon iconName="trash-outline" onPress={handleDeleteNode} />
      </View>
      <ScrollView>
        {sibilingNodes
          .filter(node => hierarchyNodesUuids.includes(node.parentUuid))
          .map(sibilingNode => (
            <TouchableOpacity
              style={styles.option}
              key={sibilingNode.uuid}
              onPress={() => handleSelectEntityNode(sibilingNode)}>
              <Text>
                {sibilingNode.value} - {sibilingNode.uuid.split('-')[0]} -
                {sibilingNode.parentUuid.split('-')[0]}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </>
  );
};

export default MultipleEntityManager;
