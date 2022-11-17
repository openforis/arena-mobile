import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import BaseForm from 'form/Attributes/common/Base/Form';
import formSelectors from 'state/form/selectors';

import FormCodeMultiple from './Multiple';
import FormCodeSingle from './Single';

const CodeForm = ({nodeDef}) => {
  const node = useSelector(formSelectors.getNode);

  return (
    <BaseForm nodeDef={nodeDef} hasSubmitButton={false}>
      {NodeDefs.isMultiple(nodeDef) ? (
        <FormCodeMultiple nodeDef={nodeDef} />
      ) : (
        <FormCodeSingle nodeDef={nodeDef} node={node} />
      )}
    </BaseForm>
  );
};

export default CodeForm;
