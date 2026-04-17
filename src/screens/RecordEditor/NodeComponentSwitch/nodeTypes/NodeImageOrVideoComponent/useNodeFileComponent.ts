import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";

import { NodeDefFileType, NodeDefs, UUIDs } from "@openforis/arena-core";

import { useRequestCameraPermission, useToast } from "hooks";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { RecordFileService } from "service/recordFileService";
import { useConfirm } from "state/confirm";
import { SettingsSelectors } from "state/settings";
import { SurveySelectors } from "state/survey/selectors";
import { ExifUtils, Files, ImageUtils, log, Permissions } from "utils";

import { useCheckCanAccessMediaLibrary } from "./useCheckCanAccessMediaLibrary";

const logPrefix = "NodeFileComponent:";

const mediaTypeByFileType: Record<string, ImagePicker.MediaType> = {
  [NodeDefFileType.image]: "images",
  [NodeDefFileType.video]: "videos",
};

const determineFileMaxSize = ({ nodeDef, settings }: any) => {
  const { imageSizeLimit, imageSizeUnlimited } = settings;
  const nodeDefFileMaxSize = NodeDefs.getFileMaxSize(nodeDef);
  if (imageSizeUnlimited) {
    return nodeDefFileMaxSize;
  }
  return Math.min(nodeDefFileMaxSize ?? 0, imageSizeLimit ?? 0);
};

const extractFileNameFromAsset = (
  asset: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset,
): string | null | undefined => {
  if ("fileName" in asset) {
    return asset.fileName;
  }
  if ("name" in asset) {
    return asset.name;
  }
  return Files.getNameFromUri(asset.uri);
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
  setResizing(false);

  return { fileUri, fileSize };
};

export const useNodeFileComponent = ({ nodeDef, nodeUuid }: any) => {
  const toaster = useToast();
  const confirm = useConfirm();
  const settings = SettingsSelectors.useSettings();
  const surveyId = SurveySelectors.useCurrentSurveyId();

  const { request: requestCameraPermission } = useRequestCameraPermission();

  const canAccessMediaLibrary = useCheckCanAccessMediaLibrary();

  const geotagInfoShown = NodeDefs.isGeotagInformationShown(nodeDef);
  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;
  const maxSizeMB = determineFileMaxSize({ nodeDef, settings });
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

  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });
  const [resizing, setResizing] = useState(false);

  const onFileSelected = useCallback(
    async (
      result:
        | ImagePicker.ImagePickerResult
        | DocumentPicker.DocumentPickerResult,
      fromCamera = false,
    ) => {
      log.debug(
        `${logPrefix} file selected; from camera: ${fromCamera} max size: ${maxSizeMB} MB`,
      );
      const { assets, canceled } = result;
      if (canceled) {
        log.debug(`${logPrefix} file selection canceled`);
        return;
      }
      const asset = assets?.[0];
      if (!asset) {
        log.debug(`${logPrefix} no assets found`);
        return;
      }
      const { uri: sourceFileUri } = asset;
      log.debug(`${logPrefix} source file uri: ${sourceFileUri}`);

      const fileName = extractFileNameFromAsset(asset);

      log.debug(`${logPrefix} extracted file name: ${fileName}`);

      const sourceFileSize = await Files.getSize(sourceFileUri);

      log.debug(`${logPrefix} source file size: ${sourceFileSize}`);

      let fileUri = sourceFileUri;
      let fileSize = sourceFileSize;

      if (
        fileType === NodeDefFileType.image &&
        maxSize &&
        sourceFileSize > maxSize
      ) {
        log.debug(
          `${logPrefix} resizing image, source file size exceeds max size (${sourceFileSize} > ${maxSize})`,
        );

        ({ fileUri, fileSize } = await resizeImage(
          sourceFileUri,
          sourceFileSize,
          maxSize,
          maxSizeMB,
          setResizing,
          toaster,
        ));
      }
      log.debug(`${logPrefix} final file: uri ${fileUri} size ${fileSize}`);
      if (
        fromCamera &&
        geotagInfoShown &&
        !(await ExifUtils.hasGpsData({ fileUri }))
      ) {
        log.debug(`${logPrefix} setting location in file`);
        await setLocationInFile(fileUri);
      }
      log.debug(`${logPrefix} updating node value`);
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri });
      log.debug(`${logPrefix} node value updated`);
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
      const errorMessage = `Error selecting file: ` + error;
      log.error(`${logPrefix} ${errorMessage}`);
      toaster(errorMessage);
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
      const errorMessage = `Error opening camera: ` + error;
      log.error(`${logPrefix} ${errorMessage}`);
      toaster(errorMessage);
    }
  }, [
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
    requestCameraPermission,
    toaster,
  ]);

  const onRotatePress = useCallback(async () => {
    const { fileUuid } = value ?? {};
    if (!fileUuid) return;

    const fileUri = RecordFileService.getRecordFileUri({ surveyId, fileUuid });
    if (!fileUri) return;

    try {
      const { uri: rotatedFileUri } = await ImageUtils.rotate(fileUri);
      const fileSize = await Files.getSize(rotatedFileUri);
      const valueUpdated = { ...value, fileUuid: UUIDs.v4(), fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri: rotatedFileUri });
    } catch (error) {
      toaster("dataEntry:fileAttributeImage.rotationError", {
        error: String(error),
      });
    }
  }, [surveyId, toaster, updateNodeValue, value]);

  const onDeletePress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:fileAttribute.deleteConfirmMessage",
      })
    ) {
      await updateNodeValue({ value: null });
    }
  }, [confirm, updateNodeValue]);

  return {
    nodeValue: value,
    onDeletePress,
    onFileChoosePress,
    onOpenCameraPress,
    onRotatePress,
    resizing,
  };
};
