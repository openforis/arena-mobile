import {NodeDefs, NodeDefType} from '@openforis/arena-core';
import React, {useState, useCallback} from 'react';
import {useSelector} from 'react-redux';

import Input from 'arena-mobile-ui/components/Input';
import {transform, textTransformValues} from 'arena/utils/textUtils';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {Form as BaseForm} from '../../Base';

// TODO move to arena-core, maybe other name
NodeDefs.getTextTransform = nodeDef => nodeDef?.props?.textTransform;

const autoCapitalizeByTransformFunction = {
  [textTransformValues.none]: undefined,
  [textTransformValues.capitalize]: 'sentences',
  [textTransformValues.lowercase]: 'none',
  [textTransformValues.uppercase]: 'characters',
};

// text default
// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const Form = ({nodeDef, keyboardType = 'default'}) => {
  const [newValue, setValue] = useState(null);
  const node = useSelector(formSelectors.getNode);

  const handleUpdateNode = useUpdateNode();

  const handleSubmit = useCallback(
    ({callback = () => null} = {}) => {
      const _newValue = newValue || String(node.value || '');

      const _value =
        nodeDef.type === NodeDefType.text
          ? transform({
              transformFunction: NodeDefs.getTextTransform(nodeDef),
            })(_newValue)
          : Number(_newValue.replace(',', '.'));
      handleUpdateNode({node, value: _value, callback});
    },
    [nodeDef, node, newValue, handleUpdateNode],
  );

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit}>
      <Input
        autoCapitalize={
          autoCapitalizeByTransformFunction[
            NodeDefs.getTextTransform(nodeDef)
          ] || undefined
        }
        onChangeText={setValue}
        defaultValue={
          nodeDef.type === NodeDefType.text
            ? String(node?.value || '')
            : String(isNaN(node?.value) ? '' : node?.value)
        }
        autoFocus={true}
        keyboardType={keyboardType}
        textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
      />
    </BaseForm>
  );
};

export default Form;
