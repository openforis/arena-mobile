import { useCallback, useMemo, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { NodeDefFileType, NodeDefs, UUIDs } from "@openforis/arena-core";

import { useRequestCameraPermission, useToast } from "hooks";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { useConfirm } from "state/confirm";
import { SettingsSelectors } from "state/settings";
import { ExifUtils, Files, ImageUtils, log, Permissions } from "utils";

import { useCheckCanAccessMediaLibrary } from "./useCheckCanAccessMediaLibrary";

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
  toaster: any
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
    [mediaTypes]
  );

  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });
  const [resizing, setResizing] = useState(false);

  const onFileSelected = useCallback(
    async (result: any, fromCamera = false) => {
      const { assets, canceled, didCancel } = result;
      if (canceled || didCancel) return;

      const asset = assets?.[0];
      if (!asset) return;

      const { name: assetFileName, uri: sourceFileUri } = asset;

      const fileName = assetFileName ?? Files.getNameFromUri(sourceFileUri);

      const sourceFileSize = await Files.getSize(sourceFileUri);

      let fileUri = sourceFileUri;
      let fileSize = sourceFileSize;

      if (
        fileType === NodeDefFileType.image &&
        maxSize &&
        sourceFileSize > maxSize
      ) {
        ({ fileUri, fileSize } = await resizeImage(
          sourceFileUri,
          sourceFileSize,
          maxSize,
          maxSizeMB,
          setResizing,
          toaster
        ));
      }
      if (
        fromCamera &&
        geotagInfoShown &&
        !(await ExifUtils.hasGpsData({ fileUri }))
      ) {
        await setLocationInFile(fileUri);
      }
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri });
    },
    [fileType, geotagInfoShown, maxSize, maxSizeMB, toaster, updateNodeValue]
  );

  const onFileChoosePress = useCallback(async () => {
    if (!(await canAccessMediaLibrary({ geotagInfoShown }))) {
      return;
    }
    const result =
      fileType === NodeDefFileType.other
        ? await DocumentPicker.getDocumentAsync()
        : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    await onFileSelected(result);
  }, [
    canAccessMediaLibrary,
    fileType,
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
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
      toaster(`Error opening camera: ` + error);
    }
  }, [
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
    requestCameraPermission,
    toaster,
  ]);

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
    onOpenCameraPress,
    onFileChoosePress,
    resizing,
  };
};
