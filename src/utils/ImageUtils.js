import { Image } from "react-native";
import { ImageManipulator } from "expo-image-manipulator";

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

  const isSizeAcceptable = () =>
    sizeRatio >= minSuccessfullSizeRatio &&
    sizeRatio <= maxSuccessfullSizeRatio;

  if (isSizeAcceptable()) {
    return generateSuccessfulResult();
  }

  let scale = 1;
  const calculateNextScale = () => Math.sqrt(sizeRatio);

  const stack = [calculateNextScale()];

  console.log("===resizing image", sourceWidth, size, maxSize);
  while (stack.length > 0) {
    scale = stack.pop();

    // max witdh always below source width (cannot enlarge original file)
    const currentMaxWidth = Math.min(
      Math.floor(sourceWidth * scale),
      sourceWidth
    );

    console.log("===scale", scale);
    console.log("=== currentMaxWidth", currentMaxWidth);

    try {
      const imageContext = ImageManipulator.manipulate(fileUri);
      imageContext.resize({ width: currentMaxWidth });
      const resizedImage = await imageContext.renderAsync();
      const {
        uri: resizedImageUri,
        height: resizedImageHeight,
        width: resizedImageWidth,
      } = await resizedImage.saveAsync({ compress: 0.9 });

      uri = resizedImageUri;
      height = resizedImageHeight;
      width = resizedImageWidth;
      size = await Files.getSize(resizedImageUri);

      sizeRatio = maxSize / size;
      console.log("=== size", size);
      console.log("=== size ratio", sizeRatio);
      console.log("====is same size", currentMaxWidth === sourceWidth);
      console.log("====size acceptable", isSizeAcceptable());
      console.log("===under max size", sizeRatio <= maxSuccessfullSizeRatio);

      if (
        isSizeAcceptable() ||
        (currentMaxWidth === sourceWidth &&
          sizeRatio <= maxSuccessfullSizeRatio)
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
    console.log("==error", error);
    return false;
  }
};

export const ImageUtils = {
  getSize,
  isValid,
  resizeToFitMaxSize,
};
