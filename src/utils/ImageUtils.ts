import { Image } from "react-native";
import { ImageManipulator, ImageResult } from "expo-image-manipulator";

import { Files } from "./Files";
import { ExifUtils } from "./ExifUtils";

const compress = 0.95; // default compression ratio for resized images

// which side of the resize scale bisection bracket was last narrowed
enum ScaleBracketSide {
  lo = "lo",
  hi = "hi",
}

export type ImageScaleResult = {
  uri: string;
  height: number;
  width: number;
  size: number;
};

export type ImageScaleError = {
  error: any;
};

const _scaleImage = async ({
  sourceFileUri,
  sourceWidth,
  scale,
}: any): Promise<ImageScaleResult> => {
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
  maxSuccessfullSizeRatio = 1.0,
}: any): Promise<ImageScaleResult | ImageScaleError> => {
  let tryings = 1;

  let lastResizeResult: ImageScaleResult = {
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

  // Bisection bracket on the resize scale: `loScale` is the largest scale
  // known to produce an acceptable-or-smaller file, `hiScale` is the
  // smallest scale known to still be oversized. File size is monotonically
  // increasing in scale, so bisecting this bracket is guaranteed to
  // converge no matter how the actual size-vs-scale curve looks (unlike a
  // pure size ~ scale^2 model guess, which can stall approaching the
  // target from one side when real compression doesn't follow that curve).
  let loScale = 0;
  let hiScale = 1;

  // If the same side of the bracket keeps narrowing two attempts in a row,
  // the model guess is repeatedly under/over-correcting from the same
  // direction instead of bracketing the target - the classic stall case for
  // this kind of guess-based bisection. When that happens, force a plain
  // bisection step, which is guaranteed to make steady progress regardless.
  let lastNarrowedSide: ScaleBracketSide | null = null;
  let sameSideStreak = 0;

  const calculateNextScale = () => {
    // size ~ scale^2 model guess, same approximation used for the initial
    // guess; used as long as it stays inside the known-safe bracket and
    // isn't stalling, so the common case (compression roughly follows the
    // model) still converges in very few attempts.
    const modelScale = scale / Math.sqrt(sizeRatio);
    const withinBracket = modelScale > loScale && modelScale < hiScale;
    if (withinBracket && sameSideStreak < 1) {
      return modelScale;
    }
    return (loScale + hiScale) / 2;
  };

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
      const narrowedSide =
        sizeRatio > 1 ? ScaleBracketSide.hi : ScaleBracketSide.lo;
      sameSideStreak =
        narrowedSide === lastNarrowedSide ? sameSideStreak + 1 : 0;
      lastNarrowedSide = narrowedSide;
      if (narrowedSide === ScaleBracketSide.hi) {
        hiScale = scale;
      } else {
        loScale = scale;
      }
      if (
        sizeRatio <= 1 &&
        (!bestScaleSizeRatio || sizeRatio > bestScaleSizeRatio)
      ) {
        bestScaleSizeRatio = sizeRatio;
        bestScaleResizeResult = lastResizeResult;
      } else {
        // delete temporary resized image file; no need to wait for it
        // before starting the next resize attempt
        Files.del(lastResizeResult.uri).catch(() => {});
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
  maxSize,
}: any): Promise<ImageScaleResult | ImageScaleError | null> => {
  const size = await Files.getSize(fileUri);
  if (size <= maxSize) return null;

  const resizeResult: ImageScaleResult | ImageScaleError = await new Promise(
    (resolve, reject) => {
      Image.getSize(
        fileUri,
        (width, height) => {
          _resizeToFitMaxSize({ fileUri, width, height, size, maxSize })
            .then((result) => resolve(result))
            .catch((error: Error) => reject(error));
        },
        (error: Error) => reject(error),
      );
    },
  );
  if ("error" in resizeResult) {
    return resizeResult;
  }
  const {
    uri: resultUri,
    width: resultWidth,
    height: resultHeight,
  } = resizeResult;

  if (fileUri !== resultUri) {
    await ExifUtils.copyData({
      sourceFileUri: fileUri,
      targetFileUri: resultUri,
      targetFileWidth: resultWidth,
      targetFileHeight: resultHeight,
      targetFileOrientation: 1,
    });
  }
  return resizeResult;
};

const rotate = async (
  fileUri: string,
  { degrees = 90 }: { degrees?: number } = {},
): Promise<ImageResult> => {
  const imageContext = ImageManipulator.manipulate(fileUri);
  imageContext.rotate(degrees);
  const rotatedImage = await imageContext.renderAsync();
  const savedImage = await rotatedImage.saveAsync({ compress });
  // copy exif data to the rotated image
  await ExifUtils.copyData({
    sourceFileUri: fileUri,
    targetFileUri: savedImage.uri,
    targetFileWidth: rotatedImage.width,
    targetFileHeight: rotatedImage.height,
    targetFileOrientation: 1,
  });
  return savedImage;
};

const getSize = async (
  fileUri: any,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(
      fileUri,
      (width, height) => resolve({ width, height }),
      (error: Error) => reject(error),
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
  rotate,
};
