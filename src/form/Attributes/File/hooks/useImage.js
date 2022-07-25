import {useCallback} from 'react';
import ImagePicker from 'react-native-image-crop-picker';

const getFilesFromImage = image => {
  const name = image.filename || (image?.path).split('/').pop() || '---.png';

  return [
    {
      ...image,
      name,
      size: image.size,
      type: image.mime,
      uri: image.path, // image.sourceURL - /private/var/mobile || file:///var/mobile/Media
    },
  ];
};

const useGetImage = ({cropping = false} = {}) => {
  const getImage = useCallback(
    ({callback = null} = {}) =>
      async () => {
        try {
          const image = await ImagePicker.openPicker({
            cropping,
            writeTempFile: false,
          });

          const files = getFilesFromImage(image);
          callback?.(files);
        } catch (err) {
          console.warn(err);
        }
      },
    [cropping],
  );

  const takePhoto = useCallback(
    ({callback = null} = {}) =>
      async () => {
        try {
          const image = await ImagePicker.openCamera({
            cropping,
            writeTempFile: true,
          });

          const files = getFilesFromImage(image);
          callback?.(files);
        } catch (err) {
          console.warn(err);
        }
      },
    [cropping],
  );

  return {getImage, takePhoto};
};
export default useGetImage;
