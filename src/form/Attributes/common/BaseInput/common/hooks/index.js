import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import throttle from 'lodash.throttle';
import {useState, useCallback} from 'react';

import {transform} from 'arena/utils/textUtils';
import {Objects} from 'infra/objectUtils';
import {useCloseNode, useUpdateNode} from 'state/form/hooks/useNodeFormActions';

const isMultiline = nodeDef => nodeDef?.props?.textInputType === 'multiLine';

const prepareValue = ({newValue, node, nodeDef}) => {
  const _newValue =
    newValue === '' || !Objects.isEmpty(newValue)
      ? newValue
      : String(node.value || '');

  const _value =
    nodeDef.type === NodeDefType.text
      ? transform({
          transformFunction: NodeDefs.getTextTransform(nodeDef),
        })(_newValue)
      : _newValue === ''
      ? ''
      : Number(_newValue.replace(',', '.'));
  return _value;
};

export const useBaseInput = ({node, nodeDef}) => {
  const [newValue, setValue] = useState(null);

  const handleUpdateNode = useUpdateNode();
  const handleClose = useCloseNode();

  const handleUpdate = useCallback(
    value => {
      const _value = prepareValue({newValue: value, node, nodeDef});
      handleUpdateNode({
        node,
        value: _value,
        callback: false,
        shouldJump: false,
      });
    },
    [nodeDef, node, handleUpdateNode],
  );

  const debouncedUpdate = useCallback(
    value => {
      setValue(value);
      throttle(handleUpdate, 500)(value);
    },
    [handleUpdate],
  );

  const handleSubmit = useCallback(
    ({callback = handleClose} = {}) => {
      const _value = prepareValue({newValue, node, nodeDef});
      handleUpdateNode({node, value: _value, callback});
    },
    [nodeDef, node, newValue, handleUpdateNode, handleClose],
  );

  const handleSubmitEnter = useCallback(() => {
    handleSubmit({callback: isMultiline(nodeDef) ? false : handleClose});
  }, [handleSubmit, handleClose, nodeDef]);

  return {
    newValue,
    setValue,
    handleUpdateNode,
    handleClose,
    handleUpdate,
    debouncedUpdate,
    handleSubmit,
    handleSubmitEnter,
  };
};
