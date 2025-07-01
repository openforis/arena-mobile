import { Image } from "react-native";
import { ImageManipulator } from "expo-image-manipulator";

import { Files } from "./Files";

const compress = 0.9;

const _scaleImage = async ({ sourceFileUri, sourceWidth, scale }) => {
  const scaledWidth = Math.floor(sourceWidth * scale);
  const imageContext = ImageManipulator.manipulate(sourceFileUri);
  imageContext.resize({ width: scaledWidth });
  const resizedImage = await imageContext.renderAsync();
  const { uri, height, width } = await resizedImage.saveAsync({ compress });
  const size = await Files.getSize(uri);
  return { uri, height, width, size };
};

const _resizeToFitMaxSize = async ({
  fileUri: sourceFileUri,
  width: sourceWidth,
  // height: sourceHeight,
  size: sourceSize,
  maxSize,
  maxTryings = 5,
  minSuccessfullSizeRatio = 0.95, // = max size - 5%
  maxSuccessfullSizeRatio = 1.0, // = max size
}) => {
  let tryings = 1;
  let uri, width, height;

  let size = sourceSize;

  const generateSuccessfulResult = () => ({ uri, size, height, width });

  const calculateSizeRatio = () => size / maxSize;

  let sizeRatio = calculateSizeRatio();

  const isSizeAcceptable = () =>
    sizeRatio >= minSuccessfullSizeRatio &&
    sizeRatio <= maxSuccessfullSizeRatio;

  if (isSizeAcceptable()) {
    return generateSuccessfulResult();
  }

  const initialScale = 1 / Math.sqrt(sizeRatio);
  let scale;
  let bestScale;
  let bestScaleSizeRatio;

  const calculateNextScale = () =>
    // max scale always 1 (cannot scale up)
    Math.min(1, scale * (sizeRatio > 1 ? 0.75 : 1.25));

  const stack = [initialScale];

  while (stack.length > 0) {
    scale = stack.pop();

    const currentMaxWidth = Math.floor(sourceWidth * scale);

    try {
      ({ uri, height, width, size } = await _scaleImage({
        sourceFileUri,
        sourceWidth,
        scale,
      }));

      sizeRatio = calculateSizeRatio();

      if (
        isSizeAcceptable() ||
        (currentMaxWidth === sourceWidth &&
          sizeRatio <= maxSuccessfullSizeRatio)
      ) {
        return generateSuccessfulResult();
      }
      if (
        sizeRatio <= 1 &&
        (!bestScaleSizeRatio || sizeRatio > bestScaleSizeRatio)
      ) {
        bestScale = scale;
        bestScaleSizeRatio = sizeRatio;
      }
      if (
        tryings < maxTryings ||
        // always try to resize to fit max size
        sizeRatio > 1
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
    tryings += 1;
  }
  if (bestScale && bestScale !== scale) {
    ({ uri, height, width, size } = await _scaleImage({
      sourceFileUri,
      sourceWidth,
      scale: bestScale,
    }));
  }
  return generateSuccessfulResult();
};

const resizeToFitMaxSize = async ({ fileUri, maxSize }) => {
  const size = await Files.getSize(fileUri);
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
    return false;
  }
};

export const ImageUtils = {
  getSize,
  isValid,
  resizeToFitMaxSize,
};
