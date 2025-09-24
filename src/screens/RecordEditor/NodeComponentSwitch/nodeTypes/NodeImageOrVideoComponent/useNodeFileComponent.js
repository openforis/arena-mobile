import { useCallback, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { NodeDefFileType, NodeDefs, UUIDs } from "@openforis/arena-core";

import {
  useRequestCameraPermission,
  useRequestImagePickerMediaLibraryPermission,
  useToast,
} from "hooks";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { useConfirm } from "state/confirm";
import { SettingsSelectors } from "state/settings";
import { Files, ImageUtils, Permissions } from "utils";

const mediaTypeByFileType = {
  [NodeDefFileType.image]: "images",
  [NodeDefFileType.video]: "videos",
};

const determineFileMaxSize = ({ nodeDef, settings }) => {
  const { imageSizeLimit, imageSizeUnlimited } = settings;
  const nodeDefFileMaxSize = NodeDefs.getFileMaxSize(nodeDef);
  if (imageSizeUnlimited) {
    return nodeDefFileMaxSize;
  }
  return Math.min(nodeDefFileMaxSize ?? 0, imageSizeLimit ?? 0);
};

const resizeImage = async (
  sourceFileUri,
  sourceFileSize,
  maxSize,
  maxSizeMB,
  setResizing,
  toaster
) => {
  setResizing(true);

  let fileUri, fileSize;

  const {
    error,
    uri: resizedFileUri,
    size: resizedFileSize,
  } = (await ImageUtils.resizeToFitMaxSize({
    fileUri: sourceFileUri,
    maxSize,
  })) || {};

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

export const useNodeFileComponent = ({ nodeDef, nodeUuid }) => {
  const toaster = useToast();
  const confirm = useConfirm();
  const settings = SettingsSelectors.useSettings();

  const { request: requestCameraPermission } = useRequestCameraPermission();
  const { request: requestImagePickerMediaLibraryPermission } =
    useRequestImagePickerMediaLibraryPermission();

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
    async (result) => {
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
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri });
    },
    [fileType, maxSize, maxSizeMB, toaster, updateNodeValue]
  );

  const onFileChoosePress = useCallback(async () => {
    if (!(await requestImagePickerMediaLibraryPermission())) return;

    if (geotagInfoShown) {
      await Permissions.requestAccessMediaLocation();
      // await Permissions.requestLocationForegroundPermission();
    }
    const result =
      fileType === NodeDefFileType.other
        ? await DocumentPicker.getDocumentAsync()
        : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    await onFileSelected(result);
  }, [
    fileType,
    geotagInfoShown,
    imagePickerOptions,
    onFileSelected,
    requestImagePickerMediaLibraryPermission,
  ]);

  const onOpenCameraPress = useCallback(async () => {
    if (!(await requestCameraPermission())) return;

    try {
      if (geotagInfoShown) {
        await Permissions.requestLocationForegroundPermission();
      }
      const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
      await onFileSelected(result);
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
