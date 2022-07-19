import {useCallback, useMemo} from 'react';

import {uuidv4} from 'infra/uuid';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import useGetFile from './useGetFile';
import useImage from './useImage';

const useFile = ({nodeDef, node, isImage = false}) => {
  // TODO type based on nodeDef
  const {getFile, types} = useGetFile();
  const {getImage} = useImage();
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
      action({node, value});
    },
    [node],
  );

  const updateFile = useCallback(
    () =>
      baseGetterFn({
        callback: getFileActionCallback(handleUpdate),
      })(),
    [baseGetterFn, handleUpdate, getFileActionCallback],
  );

  const createFile = useCallback(
    () => baseGetterFn({callback: getFileActionCallback(handleCreate)})(),
    [baseGetterFn, handleCreate, getFileActionCallback],
  );
  const deleteFile = useCallback(() => {
    handleDelete({node});
    //getFile({callback: getFileActionCallback(handleDelete)})()
  }, [node, handleDelete]);

  return {updateFile, createFile, deleteFile, getFileActionCallback};
};

export default useFile;
