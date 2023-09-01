import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {Platform} from 'react-native';

import {getValueAsString} from 'arena/node';
import {textTransformValues} from 'arena/utils/textUtils';
import Input from 'arena-mobile-ui/components/Input';

const autoCapitalizeByTransformFunction = {
  [textTransformValues.none]: undefined,
  [textTransformValues.capitalize]: 'sentences',
  [textTransformValues.lowercase]: 'none',
  [textTransformValues.uppercase]: 'characters',
};

const isMultiline = nodeDef => nodeDef?.props?.textInputType === 'multiLine';

// text default
// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const FormInput = ({
  debouncedUpdate,
  handleSubmitEnter,
  node,
  nodeDef,
  keyboardType = 'default',
}) => (
  <Input
    autoCapitalize={
      autoCapitalizeByTransformFunction[NodeDefs.getTextTransform(nodeDef)] ||
      undefined
    }
    onChangeText={debouncedUpdate}
    defaultValue={getValueAsString(nodeDef, node)}
    autoFocus={Platform.OS === 'ios' ? true : false}
    lateFocus={Platform.OS === 'ios' ? false : true}
    keyboardType={keyboardType}
    textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
    onSubmitEditing={handleSubmitEnter}
    editable={!NodeDefs.isReadOnly(nodeDef)}
    multiline={isMultiline(nodeDef)}
  />
);

export default FormInput;
