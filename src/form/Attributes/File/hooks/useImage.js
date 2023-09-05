import {useCallback} from 'react';
import {Platform} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';

const getFilesFromImage = image => {
  const name =
    image?.filename || (image?.path || '').split('/').pop() || '---.png';

  return [
    {
      ...image,
      name,
      size: image?.size,
      type: image?.mime,
      uri: image?.path, // image.sourceURL - /private/var/mobile || file:///var/mobile/Media
    },
  ];
};

const useGetImage = ({cropping = false} = {}) => {
  const compressQuality = useSelector(appSelectors.getImagesCompressQuality);
  const compressMaxHeight = useSelector(
    appSelectors.getImagesCompressMaxHeight,
  );
  const compressMaxWidth = useSelector(appSelectors.getImagesCompressMaxWidth);
  const isMaxResolution = useSelector(appSelectors.getIsMaxResolution);

  const getImage = useCallback(
    ({callback = null} = {}) =>
      async () => {
        try {
          const image = await ImagePicker.openPicker({
            cropping,
            writeTempFile: false,
            includeExif: true,
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
            includeExif: true,
            ...(isMaxResolution
              ? {}
              : {
                  compressImageQuality:
                    Platform.OS === 'ios'
                      ? Math.min(0.8, compressQuality) // this is because in IOS 0.8 is more than enough
                      : compressQuality,
                  compressImageMaxHeight: Math.floor(compressMaxHeight),
                  compressImageMaxWidth: Math.floor(compressMaxWidth),
                }),
          });

          const files = getFilesFromImage(image);
          callback?.(files);
        } catch (err) {
          console.warn(err);
        }
      },
    [
      cropping,
      compressQuality,
      compressMaxHeight,
      compressMaxWidth,
      isMaxResolution,
    ],
  );

  return {getImage, takePhoto};
};
export default useGetImage;
