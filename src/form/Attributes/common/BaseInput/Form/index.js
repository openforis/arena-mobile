import {NodeDefs, NodeDefType} from '@openforis/arena-core';
import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Input from 'arena-mobile-ui/components/Input';
import {transform, textTransformValues} from 'arena/utils/textUtils';
import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';

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
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    ({callback = null} = {}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value:
              nodeDef.type === NodeDefType.text
                ? transform({
                    transformFunction: NodeDefs.getTextTransform(nodeDef),
                  })(newValue)
                : Number((newValue || '').replace(',', '.')),
          },
          callback,
        }),
      );
    },
    [nodeDef, node, newValue, dispatch],
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
        defaultValue={String(node?.value || '')}
        autoFocus={true}
        keyboardType={keyboardType}
        textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
      />
    </BaseForm>
  );
};

export default Form;
