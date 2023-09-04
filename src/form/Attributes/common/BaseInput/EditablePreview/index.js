import React from 'react';

import {EditablePreview as BaseEditablePreview} from '../../Base';
import {useBaseInput} from '../common/hooks';
import FormInput from '../common/Input';

const NodeValueRender = ({node, nodeDef, keyboardType = 'default'}) => {
  const {debouncedUpdate, handleSubmitEnter} = useBaseInput({
    node,
    nodeDef,
  });

  return (
    <FormInput
      debouncedUpdate={debouncedUpdate}
      handleSubmitEnter={handleSubmitEnter}
      node={node}
      nodeDef={nodeDef}
      keyboardType={keyboardType}
    />
  );
};

const EditablePreview = ({nodeDef, keyboardType}) => (
  <BaseEditablePreview
    nodeDef={nodeDef}
    NodeValueRender={NodeValueRender}
    keyboardType={keyboardType}
  />
);

export default EditablePreview;
