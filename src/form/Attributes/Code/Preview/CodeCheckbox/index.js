import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';

import BaseContainer from 'form/Attributes/common/Base/common/BaseContainer';
import {Objects} from 'infra/objectUtils';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import ChipContainer from '../components/ChipsContainer';
import OptionChip from '../components/OptionChip';
import {useCode} from '../hooks';

const CodeCheckbox = ({nodeDef}) => {
  const {nodes, categoryItems, getCategoryItemLabel} = useCode(nodeDef);

  const codeActions = useNodeFormActions({nodeDef});

  const handlePress = useCallback(
    ({categoryItem, node, label}) =>
      event => {
        event.stopPropagation();
        event.preventDefault();

        let _node = node;

        if (Objects.isEmpty(_node)) {
          _node = NodeDefs.isMultiple(nodeDef)
            ? nodes.find(({value}) => Objects.isEmpty(value))
            : node || nodes[0];
        }

        let newValue = {itemUuid: categoryItem?.uuid};

        if (Objects.isEmpty(_node)) {
          codeActions.handleCreate({value: newValue});
          return;
        }
        if (Objects.isEmpty(_node.value)) {
          codeActions.handleUpdate({node: _node, value: newValue});
          return;
        }

        if (NodeDefs.isMultiple(nodeDef)) {
          codeActions.handleDelete({node: _node, label, requestConfirm: false});
          return;
        }
        codeActions.handleUpdate({
          node: _node,
          value: categoryItem.uuid !== _node?.value?.itemUuid ? newValue : null,
        });
      },
    [codeActions, nodeDef, nodes],
  );

  const options = useMemo(() => {
    return categoryItems.map(categoryItem => {
      const node = NodeDefs.isMultiple(nodeDef)
        ? nodes.find(_node => _node?.value?.itemUuid === categoryItem.uuid)
        : nodes?.[0];
      const label = getCategoryItemLabel(categoryItem);

      return {
        key: categoryItem.uuid,
        onPress: handlePress({categoryItem, node, label}),
        isActive: node?.value?.itemUuid === categoryItem.uuid,
        label,
      };
    });
  }, [getCategoryItemLabel, categoryItems, nodes, nodeDef, handlePress]);

  return (
    <BaseContainer nodeDef={nodeDef} nodes={nodes}>
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
    </BaseContainer>
  );
};

export default CodeCheckbox;
