import {NodeDefs, Objects} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import AttributeHeader from 'form/common/Header';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';
import surveySelectors from 'state/survey/selectors';

import ChipContainer from '../components/ChipsContainer';
import OptionChip from '../components/OptionChip';

import styles from './styles';

const getCategoryItemLabel = ({categoryItem, nodeDef, language}) =>
  `(${categoryItem.props.code}) ${categoryItem.props.labels[language]}`;

const CodeCheckbox = ({nodeDef}) => {
  const dispatch = useDispatch();
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const categoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const handleUpdate = useCallback(
    ({node, value = null, callback = handleClose}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value,
          },
          callback,
        }),
      );
    },
    [dispatch, handleClose],
  );

  const handleCreate = useCallback(
    ({value = null}) => {
      dispatch(
        nodesActions.createNodeWithValue({
          nodeDef,
          parentNode: parentEntityNode,
          value,
        }),
      );
    },
    [dispatch, nodeDef, parentEntityNode],
  );

  const handleDelete = useCallback(
    ({node, callback = handleClose}) => {
      dispatch(
        nodesActions.removeNode({
          node,
          callback,
        }),
      );
    },
    [dispatch, handleClose],
  );

  const handlePress = useCallback(
    ({categoryItem, node}) =>
      event => {
        event.stopPropagation();
        event.preventDefault();

        let _node = node;

        if (NodeDefs.isMultiple(nodeDef) && Objects.isEmpty(_node)) {
          _node = nodes.find(({value}) => Objects.isEmpty(value));
        }
        if (!NodeDefs.isMultiple(nodeDef) && Objects.isEmpty(_node)) {
          _node = node || nodes[0];
        }
        let newValue = {itemUuid: categoryItem.uuid};

        if (Objects.isEmpty(_node)) {
          handleCreate({value: newValue});
        } else {
          if (Objects.isEmpty(_node.value)) {
            handleUpdate({node: _node, value: newValue});
          } else {
            if (NodeDefs.isMultiple(nodeDef)) {
              handleDelete({node: _node});
            } else {
              handleUpdate({
                node: _node,
                value:
                  categoryItem.uuid !== _node?.value?.itemUuid
                    ? newValue
                    : null,
              });
            }
          }
        }
      },
    [handleUpdate, handleCreate, handleDelete, nodeDef, nodes],
  );

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  const options = useMemo(() => {
    return categoryItems.map(categoryItem => {
      const node = NodeDefs.isMultiple(nodeDef)
        ? nodes.find(_node => _node?.value?.itemUuid === categoryItem.uuid)
        : nodes?.[0];

      return {
        key: categoryItem.uuid,
        onPress: handlePress({categoryItem, node}),
        isActive: node?.value?.itemUuid === categoryItem.uuid,
        label: getCategoryItemLabel({
          categoryItem,
          language,
        }),
      };
    });
  }, [categoryItems, nodes, nodeDef, language, handlePress]);

  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />

      <ChipContainer>
        {options.map(({key, onPress, isActive, label}) => (
          <OptionChip
            key={key}
            onPress={onPress}
            isActive={isActive}
            label={label}
          />
        ))}
      </ChipContainer>
    </View>
  );
};

export default CodeCheckbox;
