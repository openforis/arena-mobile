import React, {useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import Label from 'form/common/Label';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const MultipleEntityManager = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const siblingNodesInhierarchy = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, parentEntityNodeDef),
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
        <Label nodeDef={parentEntityNodeDef} />

        <TouchableIcon iconName="trash-outline" onPress={handleDeleteNode} />
      </View>
      <ScrollView>
        {siblingNodesInhierarchy.map(siblingNode => (
          <TouchableOpacity
            style={styles.option}
            key={siblingNode.uuid}
            onPress={() => handleSelectEntityNode(siblingNode)}>
            <Text>
              {siblingNode.value} - {siblingNode.uuid.split('-')[0]} -
              {siblingNode.parentUuid.split('-')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default MultipleEntityManager;
