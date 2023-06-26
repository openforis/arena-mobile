import React from 'react';
import {useSelector} from 'react-redux';

import BaseForm from 'form/Attributes/common/Base/Form';
import formSelectors from 'state/form/selectors';

import {BooleanAttribute} from '../Preview';

const BooleanForm = () => {
  const nodeDef = useSelector(formSelectors.getNodeDef);
  const node = useSelector(formSelectors.getNode);

  return (
    <BaseForm nodeDef={nodeDef} nodes={[node]}>
      <BooleanAttribute node={node} nodeDef={nodeDef} />
    </BaseForm>
  );
};

export default BooleanForm;
