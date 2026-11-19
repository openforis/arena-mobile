import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";

import {
  ArenaNodeDefFile,
  NodeDefFileType,
  NodeDefs,
  Objects,
  UUIDs,
} from "@openforis/arena-core";

import {
  useAsyncValueEffect,
  useRequestCameraPermission,
  useToast,
} from "hooks";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { RecordFileService } from "service/recordFileService";
import { SettingsSelectors } from "state/settings";
import { SurveySelectors } from "state/survey/selectors";
import { ExifUtils, Files, ImageUtils, log, Permissions } from "utils";

import { useCheckCanAccessMediaLibrary } from "./useCheckCanAccessMediaLibrary";
import { NodeComponentProps } from "../nodeComponentPropTypes";

const logPrefix = "NodeFileComponent:";

// result of the check of the file being missing in the device storage
type FileMissingCheck = { fileUuid: string | undefined; missing: boolean };

const logDebug = (message: string) => {
  log.debug(`${logPrefix} ${message}`);
};

const mediaTypeByFileType: Record<string, ImagePicker.MediaType> = {
  [NodeDefFileType.image]: "images",
  [NodeDefFileType.video]: "videos",
};

const determineFileMaxSize = ({
  nodeDef,
  settings,
}: {
  nodeDef: ArenaNodeDefFile;
  settings: { imageSizeLimit?: number; imageSizeUnlimited?: boolean };
}) => {
  const { imageSizeLimit, imageSizeUnlimited } = settings;
  const nodeDefFileMaxSize = NodeDefs.getFileMaxSize(nodeDef);
  if (imageSizeUnlimited) {
    return nodeDefFileMaxSize;
  }
  const limits = [nodeDefFileMaxSize, imageSizeLimit].filter(
    (limit): limit is number => !!limit,
  );
  return limits.length > 0 ? Math.min(...limits) : undefined;
};

const extractFileNameFromAsset = (
  asset: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset,
): string | null | undefined => {
  let fileName: string | null | undefined;
  if ("fileName" in asset) {
    fileName = asset.fileName;
  } else if ("name" in asset) {
    fileName = asset.name;
  }
  return Objects.isNotEmpty(fileName)
    ? fileName
    : Files.getNameFromUri(asset.uri);
};

const setLocationInFile = async (fileUri: any) => {
  // get current location and set it in file exif metadata
  try {
    if (await Permissions.requestLocationForegroundPermission()) {
      const location = await Location.getCurrentPositionAsync();
      if (location) {
        await ExifUtils.writeGpsData({ fileUri, location });
      }
    }
  } catch (error) {
    // ignore it
    log.error("Error setting location in file exif data: " + error);
  }
};

const resizeImage = async (
  sourceFileUri: any,
  sourceFileSize: any,
  maxSize: any,
  maxSizeMB: any,
  setResizing: any,
  toaster: any,
) => {
  setResizing(true);
  try {
    let fileUri, fileSize;

    const imageScaleResult = await ImageUtils.resizeToFitMaxSize({
      fileUri: sourceFileUri,
      maxSize,
    });

    let resizedFileUri, resizedFileSize, error;
    if (imageScaleResult) {
      if ("error" in imageScaleResult) {
        error = imageScaleResult.error;
      } else {
        ({ size: resizedFileSize, uri: resizedFileUri } = imageScaleResult);
      }
    }

    if (!error && resizedFileUri) {
      fileUri = resizedFileUri;
      fileSize = resizedFileSize;

      toaster("dataEntry:fileAttributeImage.pictureResizedToSize", {
        size: Files.toHumanReadableFileSize(resizedFileSize),
        maxSizeMB,
      });
    } else {
      fileUri = sourceFileUri;
      fileSize = sourceFileSize;
    }

    return { fileUri, fileSize };
  } finally {
    setResizing(false);
  }
};

export const useNodeFileComponent = ({
  nodeDef,
  nodeUuid,
}: Pick<NodeComponentProps<ArenaNodeDefFile>, "nodeDef" | "nodeUuid">) => {
  const toaster = useToast();
  const imageSizeLimit = SettingsSelectors.useImageSizeLimit();
  const imageSizeUnlimited = SettingsSelectors.useImageSizeUnlimited();
  const surveyId = SurveySelectors.useCurrentSurveyId();

  const { request: requestCameraPermission } = useRequestCameraPermission();

  const canAccessMediaLibrary = useCheckCanAccessMediaLibrary();

  const geotagInfoShown = NodeDefs.isGeotagInformationShown(nodeDef);
  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;
  const maxSizeMB = determineFileMaxSize({
    nodeDef,
    settings: { imageSizeLimit, imageSizeUnlimited },
  });
  const maxSize = maxSizeMB ? maxSizeMB * Math.pow(1024, 2) : undefined;

  const mediaTypes = mediaTypeByFileType[fileType];

  const imagePickerOptions = useMemo(
    () => ({
      allowEditing: false,
      exif: true,
      legacy: true,
      mediaTypes,
      quality: 1,
    }),
    [mediaTypes],
  );

  const {
    value,
    updateNodeValue,
    onClearPress: onDeletePress,
  } = useNodeComponentLocalState({
    nodeUuid,
    clearConfirmMessageKey: "dataEntry:fileAttribute.deleteConfirmMessage",
  });
  const [resizing, setResizing] = useState(false);
  const [rotating, setRotating] = useState(false);

  const { fileUuid } = value ?? {};

  const fetchFileMissing = useCallback(async (): Promise<FileMissingCheck> => {
    if (!fileUuid) return { fileUuid, missing: false };
    try {
      const missing = await RecordFileService.recordFileMissing({
        surveyId,
        fileUuid,
      });
      return { fileUuid, missing };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(
        `${logPrefix} Error checking if file is missing: ${errorMessage}`,
      );
      return { fileUuid, missing: false };
    }
  }, [surveyId, fileUuid]);

  const [fileMissingCheck] = useAsyncValueEffect(
    fetchFileMissing,
    [fetchFileMissing],
    { initialValue: { fileUuid: undefined, missing: false } },
  );
  // not missing while the file selected last is being checked
  const fileMissing =
    fileMissingCheck.fileUuid === fileUuid && fileMissingCheck.missing;

  const onFileSelected = useCallback(
    async (
      result:
        ImagePicker.ImagePickerResult | DocumentPicker.DocumentPickerResult,
      fromCamera = false,
    ) => {
      logDebug(
        `file selected; from camera: ${fromCamera} max size: ${maxSizeMB} MB`,
      );
      const { assets, canceled } = result;
      if (canceled) {
        logDebug("file selection canceled");
        return;
      }
      const asset = assets?.[0];
      if (!asset) {
        logDebug("no assets found");
        return;
      }
      const { uri: sourceFileUri } = asset;

      logDebug(`source file uri: ${sourceFileUri}`);

      const fileName = extractFileNameFromAsset(asset);

      logDebug(`extracted file name: ${fileName}`);

      const sourceFileSize = await Files.getSize(sourceFileUri);

      logDebug(`source file size: ${sourceFileSize}`);

      let fileUri = sourceFileUri;
      let fileSize = sourceFileSize;

      if (
        fileType === NodeDefFileType.image &&
        maxSize &&
        sourceFileSize > maxSize
      ) {
        logDebug(
          `resizing image, source file size exceeds max size (${sourceFileSize} > ${maxSize})`,
        );

        ({ fileUri, fileSize } = await resizeImage(
          sourceFileUri,
          sourceFileSize,
          maxSize,
          maxSizeMB,
          setResizing,
          toaster,
        ));
        logDebug(`image resized: final size ${fileSize}`);
      }
      if (
        fromCamera &&
        geotagInfoShown &&
        !(await ExifUtils.hasGpsData({ fileUri }))
      ) {
        logDebug("setting location in file...");
        await setLocationInFile(fileUri);
        logDebug("location in file set");
      }
      logDebug("updating node value...");
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      updateNodeValue({
        value: valueUpdated,
        fileUri,
        ignoreDelay: true,
      });
      logDebug("node value updated");
    },
    [fileType, geotagInfoShown, maxSize, maxSizeMB, toaster, updateNodeValue],
  );

  const onFileChoosePress = useCallback(async () => {
    if (!(await canAccessMediaLibrary({ geotagInfoShown }))) {
      return;
    }
    try {
      const result =
        fileType === NodeDefFileType.other
          ? await DocumentPicker.getDocumentAsync()
          : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

      await onFileSelected(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(`${logPrefix} Error selecting file: ${errorMessage}`);
      toaster("dataEntry:fileAttribute.fileSelectError", {
        error: errorMessage,
      });
    }
  }, [
    canAccessMediaLibrary,
    fileType,
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
    toaster,
  ]);

  const onOpenCameraPress = useCallback(async () => {
    if (!(await requestCameraPermission())) return;

    try {
      if (geotagInfoShown) {
        // request location permission to allow using location in camera app
        await Permissions.requestLocationForegroundPermission();
      }
      const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
      await onFileSelected(result, true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(`${logPrefix} Error opening camera: ${errorMessage}`);
      toaster("dataEntry:fileAttributeImage.cameraOpenError", {
        error: errorMessage,
      });
    }
  }, [
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
    requestCameraPermission,
    toaster,
  ]);

  const onRotatePress = useCallback(async () => {
    if (rotating || !fileUuid) return;

    setRotating(true);

    try {
      const fileUri = RecordFileService.getRecordFileUri({
        surveyId,
        fileUuid,
      });
      if (!fileUri) return;
      if (!(await Files.exists(fileUri))) {
        throw new Error("file not found");
      }

      const { uri: rotatedFileUri } = await ImageUtils.rotate(fileUri);
      const fileSize = await Files.getSize(rotatedFileUri);
      const valueUpdated = { ...value, fileUuid: UUIDs.v4(), fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri: rotatedFileUri });
    } catch (error) {
      toaster("dataEntry:fileAttributeImage.rotationError", {
        error: String(error),
      });
    } finally {
      setRotating(false);
    }
  }, [surveyId, toaster, updateNodeValue, fileUuid, value, rotating]);

  return {
    nodeValue: value,
    fileMissing,
    onDeletePress,
    onFileChoosePress,
    onOpenCameraPress,
    onRotatePress,
    rotating,
    resizing,
  };
};
