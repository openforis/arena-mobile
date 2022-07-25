import {NodeDefs, Objects} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {BasePreviewContainer} from 'form/Attributes/common/Base/Preview';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import surveySelectors from 'state/survey/selectors';

import ChipContainer from '../components/ChipsContainer';
import OptionChip from '../components/OptionChip';

const getCategoryItemLabel = ({categoryItem, language}) =>
  `(${categoryItem.props.code}) ${categoryItem.props.labels[language]}`;

const CodeCheckbox = ({nodeDef}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const categoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const {handleDelete, handleCreate, handleUpdate} = useNodeFormActions({
    nodeDef,
  });

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
        let newValue = {itemUuid: categoryItem?.uuid};

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
    <BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
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
    </BasePreviewContainer>
  );
};

export default CodeCheckbox;
