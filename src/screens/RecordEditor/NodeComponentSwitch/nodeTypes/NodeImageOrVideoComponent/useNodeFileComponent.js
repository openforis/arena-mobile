import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { NodeDefFileType, NodeDefs, UUIDs } from "@openforis/arena-core";

import {
  useRequestCameraPermission,
  useRequestImagePickerMediaLibraryPermission,
  useRequestMediaLibraryPermission,
  useToast,
} from "hooks";

import { useConfirm } from "state/confirm";
import { Files, ImageUtils, SystemUtils } from "utils";

import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { SettingsSelectors } from "state/settings";

const mediaTypesByFileType = {
  [NodeDefFileType.image]: ImagePicker.MediaTypeOptions.Images,
  [NodeDefFileType.video]: ImagePicker.MediaTypeOptions.Videos,
};

const mediaTypeByFileType = {
  [NodeDefFileType.image]: "photo",
  [NodeDefFileType.video]: "video",
};

const determineFileMaxSize = ({ nodeDef, settings }) => {
  const { imageSizeLimit, imageSizeUnlimited } = settings;
  const nodeDefFileMaxSize = NodeDefs.getFileMaxSize(nodeDef);
  if (imageSizeUnlimited) {
    return nodeDefFileMaxSize;
  }
  return Math.min(nodeDefFileMaxSize ?? 0, imageSizeLimit ?? 0);
};

export const useNodeFileComponent = ({ nodeDef, nodeUuid }) => {
  const toaster = useToast();
  const confirm = useConfirm();
  const settings = SettingsSelectors.useSettings();

  const { request: requestCameraPermission } = useRequestCameraPermission();
  const {
    hasPermission: hasMediaLibraryPermission,
    request: requestMediaLibraryPermission,
  } = useRequestMediaLibraryPermission();
  const { request: requestImagePickerMediaLibraryPermission } =
    useRequestImagePickerMediaLibraryPermission();

  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;
  const maxSizeMB = determineFileMaxSize({ nodeDef, settings });
  const maxSize = maxSizeMB ? maxSizeMB * Math.pow(1024, 2) : undefined;

  const mediaTypes =
    mediaTypesByFileType[fileType] ?? ImagePicker.MediaTypeOptions.All;

  const imagePickerOptions = {
    allowEditing: false,
    exif: true,
    legacy: true,
    mediaTypes,
    quality: 1,
  };

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

      const {
        name: assetFileName,
        uri: sourceFileUri,
        exif: assetExif,
        assetId,
      } = asset;

      console.log("===asset", JSON.stringify(asset));

      const fileName = assetFileName ?? Files.getNameFromUri(sourceFileUri);

      const sourceFileSize = await Files.getSize(sourceFileUri);

      let fileUri = sourceFileUri;
      let fileSize = sourceFileSize;

      // TODO remove it
      // const exifTags = await ImageUtils.getExifTags(sourceFileUri);
      const reqResult = await requestMediaLibraryPermission();
      console.warn(
        "---media library permission?",
        hasMediaLibraryPermission,
        reqResult
      );
      if (reqResult) {
        const assetInfo = await Files.getAssetInfo(assetId);
        SystemUtils.copyValueToClipboard(JSON.stringify(assetInfo));
        console.log("---asset info", JSON.stringify(assetInfo));
      } else {
        console.warn("---no media library permission");
      }

      if (
        fileType === NodeDefFileType.image &&
        maxSize &&
        sourceFileSize > maxSize
      ) {
        // resize image
        setResizing(true);
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
        }
        setResizing(false);
      }
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri });
    },
    [
      fileType,
      hasMediaLibraryPermission,
      maxSize,
      maxSizeMB,
      requestMediaLibraryPermission,
      toaster,
      updateNodeValue,
    ]
  );

  const onFileChoosePress = useCallback(async () => {
    if (
      !(await requestMediaLibraryPermission()) ||
      !(await requestImagePickerMediaLibraryPermission())
    )
      return;

    const result =
      fileType === NodeDefFileType.other
        ? await DocumentPicker.getDocumentAsync()
        : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    await onFileSelected(result);
  }, [
    fileType,
    mediaTypes,
    onFileSelected,
    requestImagePickerMediaLibraryPermission,
    requestMediaLibraryPermission,
  ]);

  const onOpenCameraPress = useCallback(async () => {
    if (
      !(await requestCameraPermission()) ||
      !(await requestMediaLibraryPermission())
    )
      return;
    try {
      const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
      await onFileSelected(result);
    } catch (error) {
      console.log("---error taking picture", error);
    }
  }, [
    onFileSelected,
    requestCameraPermission,
    requestMediaLibraryPermission,
    hasMediaLibraryPermission,
    mediaTypes,
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
