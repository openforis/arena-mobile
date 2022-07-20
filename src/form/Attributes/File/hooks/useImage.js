import {useCallback} from 'react';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';

const getFilesFromImage = image => {
  console.log(image);
  return [
    {
      ...image,
      name: image.filename,
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
          const image = await ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping,
          });

          //setUri(image.path);
          //props.onChange?.(image);

          const files = getFilesFromImage(image);
          callback?.(files);
        } catch (err) {
          console.warn(err);
        }
      },
    [cropping],
  );

  return {getImage};
};
export default useGetImage;
