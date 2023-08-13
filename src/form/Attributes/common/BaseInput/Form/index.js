import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import throttle from 'lodash.throttle';
import React, {useState, useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {useSelector} from 'react-redux';

import {transform, textTransformValues} from 'arena/utils/textUtils';
import Input from 'arena-mobile-ui/components/Input';
import {Objects} from 'infra/objectUtils';
import {useCloseNode, useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {Form as BaseForm} from '../../Base';

const autoCapitalizeByTransformFunction = {
  [textTransformValues.none]: undefined,
  [textTransformValues.capitalize]: 'sentences',
  [textTransformValues.lowercase]: 'none',
  [textTransformValues.uppercase]: 'characters',
};

export const getValueAsString = (nodeDef, node, defaultValue = '') => {
  if (nodeDef.type === NodeDefType.text) {
    return String(node?.value || defaultValue);
  }
  if (isNaN(node?.value)) {
    return String(defaultValue);
  }
  return String(node?.value);
};

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

// text default
// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const Form = ({nodeDef, keyboardType = 'default'}) => {
  const [newValue, setValue] = useState(null);
  const node = useSelector(formSelectors.getNode);

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

  const nodes = useMemo(() => [node], [node]);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={nodes}>
      <Input
        autoCapitalize={
          autoCapitalizeByTransformFunction[
            NodeDefs.getTextTransform(nodeDef)
          ] || undefined
        }
        onChangeText={debouncedUpdate}
        defaultValue={getValueAsString(nodeDef, node)}
        autoFocus={Platform.OS === 'ios' ? true : false}
        lateFocus={Platform.OS === 'ios' ? false : true}
        keyboardType={keyboardType}
        textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
        onSubmitEditing={handleSubmit}
        editable={!NodeDefs.isReadOnly(nodeDef)}
      />
    </BaseForm>
  );
};

export default Form;
