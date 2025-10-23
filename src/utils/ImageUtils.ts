import { Image } from "react-native";
import { ImageManipulator } from "expo-image-manipulator";

import { Files } from "./Files";
import { ExifUtils } from "./ExifUtils";

const compress = 0.95; // default compression ratio for resized images

const _scaleImage = async ({
  sourceFileUri,
  sourceWidth,
  scale
}: any) => {
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
  height: sourceHeight,
  size: sourceSize,
  maxSize,
  maxTryings = 5,

  // = max size - 5%
  minSuccessfullSizeRatio = 0.95,

  // = max size
  maxSuccessfullSizeRatio = 1.0
}: any) => {
  let tryings = 1;

  let lastResizeResult = {
    uri: sourceFileUri,
    size: sourceSize,
    height: sourceHeight,
    width: sourceWidth,
  };

  const calculateSizeRatio = () => lastResizeResult.size / maxSize;

  let sizeRatio = calculateSizeRatio();

  const isSizeAcceptable = () =>
    sizeRatio >= minSuccessfullSizeRatio &&
    sizeRatio <= maxSuccessfullSizeRatio;

  if (isSizeAcceptable()) {
    return lastResizeResult;
  }

  const initialScale = 1 / Math.sqrt(sizeRatio);
  let scale: any;
  let bestScaleSizeRatio;
  let bestScaleResizeResult;

  const calculateNextScale = () =>
    // max scale always 1 (cannot scale up)
    Math.min(1, scale * (sizeRatio > 1 ? 0.75 : 1.25));

  const stack = [initialScale];

  while (stack.length > 0) {
    scale = stack.pop();

    const currentMaxWidth = Math.floor(sourceWidth * scale);

    try {
      lastResizeResult = await _scaleImage({
        sourceFileUri,
        sourceWidth,
        scale,
      });

      sizeRatio = calculateSizeRatio();

      if (
        isSizeAcceptable() ||
        (currentMaxWidth === sourceWidth &&
          sizeRatio <= maxSuccessfullSizeRatio)
      ) {
        return lastResizeResult;
      }
      if (
        sizeRatio <= 1 &&
        (!bestScaleSizeRatio || sizeRatio > bestScaleSizeRatio)
      ) {
        bestScaleSizeRatio = sizeRatio;
        bestScaleResizeResult = lastResizeResult;
      } else {
        // delete temporary resized image file
        await Files.del(lastResizeResult.uri);
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
  return bestScaleResizeResult ?? lastResizeResult;
};

const resizeToFitMaxSize = async ({
  fileUri,
  maxSize
}: any) => {
  const size = await Files.getSize(fileUri);
  if (size <= maxSize) return null;

  const resizeResult = await new Promise((resolve, reject) => {
    Image.getSize(
      fileUri,
      (width, height) => {
        _resizeToFitMaxSize({ fileUri, width, height, size, maxSize }).then(
          (result) => resolve(result)
        );
      },
      (error) => reject(error)
    );
  });
  // @ts-expect-error TS(2339): Property 'uri' does not exist on type 'unknown'.
  const { uri: resultUri } = resizeResult;
  if (fileUri !== resultUri) {
    await ExifUtils.copyData({
      sourceFileUri: fileUri,
      targetFileUri: resultUri,
    });
  }
  return resizeResult;
};

const getSize = async (fileUri: any) => new Promise((resolve, reject) => {
  Image.getSize(
    fileUri,
    (width, height) => resolve({ width, height }),
    (error) => reject(error)
  );
});

const getGPSLocation = async (fileUri: any) => {
  const exifInfo = await ExifUtils.readData({ fileUri });
  if (!exifInfo) {
    return null;
  }
  const { GPSLatitude: latitude, GPSLongitude: longitude } = exifInfo;
  return { latitude, longitude };
};

const isValid = async (fileUri: any) => {
  try {
    const size = await getSize(fileUri);
    return !!size;
  } catch (error) {
    return false;
  }
};

export const ImageUtils = {
  getSize,
  getGPSLocation,
  isValid,
  resizeToFitMaxSize,
};
