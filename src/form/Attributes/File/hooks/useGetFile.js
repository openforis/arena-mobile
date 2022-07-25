import {useCallback} from 'react';
import DocumentPicker, {types} from 'react-native-document-picker';

const useGetFile = ({multiple = false, type = [types.allFiles]} = {}) => {
  const getFile = useCallback(
    ({multiple: _multiple = multiple, callback, type: _type = type}) =>
      async () => {
        try {
          const documents = await DocumentPicker.pick({
            presentationStyle: 'fullScreen',
            type,
          });

          callback?.(documents);
        } catch (err) {
          console.warn(err);
        }
      },
    [multiple, type],
  );

  return {getFile, types};
};
export default useGetFile;
