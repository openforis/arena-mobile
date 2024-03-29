import {useCallback, useMemo} from 'react';

import {uuidv4} from 'infra/uuid';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import {pickerTypes} from './useFilePickerModal';
import useGetFile from './useGetFile';
import useImage from './useImage';
const useFile = ({nodeDef, node, isImage = false}) => {
  const {getFile} = useGetFile();
  const {getImage, takePhoto} = useImage();
  const {handleCreate, handleUpdate, handleDelete} = useNodeFormActions({
    nodeDef,
  });
  const baseGetterFn = useMemo(
    () => (isImage ? getImage : getFile),
    [getFile, getImage, isImage],
  );

  const getFileActionCallback = useCallback(
    action => documents => {
      const [document] = documents;

      const value = {
        ...document,
        fileName: document.name,
        fileSize: document.size,
        fileUuid: node?.value?.fileUuid || uuidv4(),
      };

      const fileKeys = ['fileName', 'fileSize', 'fileUuid', 'uri'];
      const fileValueFiltered = Object.keys(value).reduce((acc, key) => {
        if (fileKeys.includes(key)) {
          acc[key] = value[key];
        }
        return acc;
      }, {});

      action({node, value: fileValueFiltered});
    },
    [node],
  );

  const updateFile = useCallback(
    action =>
      (action || baseGetterFn)({
        callback: getFileActionCallback(handleUpdate),
      })(),
    [baseGetterFn, handleUpdate, getFileActionCallback],
  );

  const createFile = useCallback(
    action =>
      (action || baseGetterFn)({
        callback: getFileActionCallback(handleCreate),
      })(),
    [baseGetterFn, handleCreate, getFileActionCallback],
  );
  const deleteFile = useCallback(() => {
    handleDelete({
      node,
      label: node?.value?.fileName,
      requestConfirm: true,
      isImage: true,
    });
    //getFile({callback: getFileActionCallback(handleDelete)})()
  }, [node, handleDelete]);

  const handleByPickerType = useCallback(
    pickerType => () => {
      const createOrUpdate = node.uuid ? updateFile : createFile;

      if (pickerType === pickerTypes.document) {
        return createOrUpdate(getFile);
      }
      if (pickerType === pickerTypes.camera) {
        return createOrUpdate(takePhoto);
      }
      if (pickerType === pickerTypes.gallery) {
        return createOrUpdate(getImage);
      }
      if (pickerType === pickerTypes.audio) {
        return createOrUpdate(getFile);
      }
      return createOrUpdate();
    },
    [node, updateFile, createFile, getFile, getImage, takePhoto],
  );
  return {
    updateFile,
    createFile,
    deleteFile,
    getFileActionCallback,
    handleByPickerType,
  };
};

export default useFile;
