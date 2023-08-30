import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import formSelectors from 'state/form/selectors';

import {Form as BaseForm} from '../../Base';
import {useBaseInput} from '../common/hooks';
import FormInput from '../common/Input';

const Form = ({nodeDef, keyboardType = 'default'}) => {
  const node = useSelector(formSelectors.getNode);

  const {handleSubmit, handleSubmitEnter, debouncedUpdate} = useBaseInput({
    node,
    nodeDef,
  });

  const nodes = useMemo(() => [node], [node]);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={nodes}>
      <FormInput
        debouncedUpdate={debouncedUpdate}
        handleSubmitEnter={handleSubmitEnter}
        node={node}
        nodeDef={nodeDef}
        keyboardType={keyboardType}
      />
    </BaseForm>
  );
};

export default Form;
