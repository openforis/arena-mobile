import {useCallback, useMemo} from 'react';

import useGetFile from './useGetFile';
import useImage from './useImage';
import useNodeFormActions from './useNodeFormActions';

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
      // copy file in filesystem or delete the old one if needed also when remove a survey or nodes with files
      if (node.value) {
        // remove File from System
      } else {
        // create File on System
      }
      console.log('document', document);

      const value = {
        fileName: document.name,
        fileSize: document.size,
        fileUuid: 'aa',
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
