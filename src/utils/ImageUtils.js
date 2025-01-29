import { Image } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { Files } from "./Files";

const _resizeToFitMaxSize = async ({
  fileUri,
  width: sourceWidth,
  // height: sourceHeight,
  size: sourceSize,
  maxSize,
  maxTryings = 10,
  minSuccessfullSizeRatio = 1, // = max size
  maxSuccessfullSizeRatio = 1.05, // = max size - 5%
}) => {
  let tryings = 1;
  let uri, width, height;

  let size = sourceSize;

  const generateSuccessfulResult = () => ({ uri, size, height, width });

  let sizeRatio = maxSize / size;

  if (
    sizeRatio >= minSuccessfullSizeRatio &&
    sizeRatio <= maxSuccessfullSizeRatio
  ) {
    return generateSuccessfulResult();
  }

  let scale = 1;
  const calculateNextScale = () => scale * sizeRatio; // scale * size ratio

  const stack = [calculateNextScale()];

  while (stack.length > 0) {
    scale = stack.pop();

    const currentMaxWidth = Math.floor(sourceWidth * scale);

    try {
      const {
        uri: resizedImageUri,
        height: resizedImageHeight,
        width: resizedImageWidth,
      } = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: currentMaxWidth } }],
        { compress: 0.9 }
      );

      uri = resizedImageUri;
      height = resizedImageHeight;
      width = resizedImageWidth;
      size = await Files.getSize(resizedImageUri);
      sizeRatio = maxSize / size;

      if (
        sizeRatio >= minSuccessfullSizeRatio &&
        sizeRatio <= maxSuccessfullSizeRatio
      ) {
        return generateSuccessfulResult();
      }
      if (
        tryings < maxTryings ||
        // always try to resize to fit max size
        sizeRatio < 1
      ) {
        stack.push(calculateNextScale());
      } else {
        // stop if max tryings reached and current size is less than maxSize
      }
    } catch (error) {
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
      return { error };
    }
    tryings = tryings + 1;
  }
  return generateSuccessfulResult();
};

const resizeToFitMaxSize = async ({ fileUri, maxSize }) => {
  const info = await Files.getInfo(fileUri);
  const { size } = info;
  if (size <= maxSize) return null;

  return new Promise((resolve) => {
    Image.getSize(fileUri, (width, height) => {
      _resizeToFitMaxSize({ fileUri, width, height, size, maxSize }).then(
        (result) => resolve(result)
      );
    });
  });
};

const getSize = async (fileUri) =>
  new Promise((resolve, reject) => {
    Image.getSize(
      fileUri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });

const isValid = async (fileUri) => {
  try {
    const size = await getSize(fileUri);
    return !!size;
  } catch (error) {
    console.log("==error", error);
    return false;
  }
};

export const ImageUtils = {
  getSize,
  isValid,
  resizeToFitMaxSize,
};
