import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import BaseForm from 'form/Attributes/common/Base/Form';
import {useCloseNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import FormCodeMultiple from './Multiple';
import FormCodeSingle from './Single';
const CodeForm = ({nodeDef}) => {
  const node = useSelector(formSelectors.getNode);
  const handleClose = useCloseNode();

  const nodes = useMemo(() => [node], [node]);

  return (
    <BaseForm
      nodes={nodes}
      nodeDef={nodeDef}
      hasSubmitButton={NodeDefs.isMultiple(nodeDef)}
      handleSubmit={handleClose}>
      {NodeDefs.isMultiple(nodeDef) ? (
        <FormCodeMultiple nodeDef={nodeDef} />
      ) : (
        <FormCodeSingle nodeDef={nodeDef} node={node} />
      )}
    </BaseForm>
  );
};

export default CodeForm;
