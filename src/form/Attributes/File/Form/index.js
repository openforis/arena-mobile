import React, {useState, useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import Input from 'arena-mobile-ui/components/Input';
import BaseForm from 'form/Attributes/common/Base/Form';
import {selectors as filesSelectors} from 'state/files';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import MoreInfo from '../components/MoreInfo';
import Preview from '../components/Preview';

const Form = ({nodeDef}) => {
  const {t} = useTranslation();
  const canEditName = false;
  const [newValue, setValue] = useState({});
  const node = useSelector(formSelectors.getNode);
  const file = useSelector(state =>
    filesSelectors.getFileByUuid(state, newValue?.fileUuid),
  );

  const handleUpdateNode = useUpdateNode();

  const handleSubmit = useCallback(
    ({callback = () => null} = {}) => {
      handleUpdateNode({node, value: Object.assign({}, newValue), callback});
    },
    [node, newValue, handleUpdateNode],
  );

  const handleUpdateValue = useCallback(
    field => valueUpdated => {
      setValue(prevValue =>
        Object.assign({}, prevValue, {
          [field]: valueUpdated,
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (node.value) {
      setValue(Object.assign({}, node.value));
    }
  }, [node.value]);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={[node]}>
      {canEditName && (
        <Input
          title={t('Form:nodeDefFile.name')}
          onChangeText={handleUpdateValue('name')}
          defaultValue={String(newValue.name || node?.value?.name || '')}
          textAlign="right"
        />
      )}
      <Preview node={node} file={file} nodeDef={nodeDef} />
      <MoreInfo node={node} />
    </BaseForm>
  );
};

export default Form;
