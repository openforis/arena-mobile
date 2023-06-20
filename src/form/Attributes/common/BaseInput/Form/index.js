import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import React, {useState, useCallback} from 'react';
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

// text default
// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const Form = ({nodeDef, keyboardType = 'default'}) => {
  const [newValue, setValue] = useState(null);
  const node = useSelector(formSelectors.getNode);

  const handleUpdateNode = useUpdateNode();
  const handleClose = useCloseNode();
  const handleSubmit = useCallback(
    ({callback = handleClose} = {}) => {
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
      handleUpdateNode({node, value: _value, callback});
    },
    [nodeDef, node, newValue, handleUpdateNode, handleClose],
  );

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={[node]}>
      <Input
        autoCapitalize={
          autoCapitalizeByTransformFunction[
            NodeDefs.getTextTransform(nodeDef)
          ] || undefined
        }
        onChangeText={setValue}
        defaultValue={getValueAsString(nodeDef, node)}
        autoFocus={Platform.OS === 'ios' ? true : false}
        lateFocus={Platform.OS === 'ios' ? false : true}
        keyboardType={keyboardType}
        textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
        onSubmitEditing={handleSubmit}
      />
    </BaseForm>
  );
};

export default Form;
