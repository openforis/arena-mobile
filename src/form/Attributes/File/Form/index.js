import React, {useState, useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Input from 'arena-mobile-ui/components/Input';
import BaseForm from 'form/Attributes/common/Base/Form';
import {selectors as filesSelectors} from 'state/files';
import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';

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
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    ({callback = null} = {}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value: Object.assign({}, newValue),
          },
          callback,
        }),
      );
    },
    [node, newValue, dispatch],
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
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit}>
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
