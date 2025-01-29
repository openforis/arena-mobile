import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { NodeDefFileType, UUIDs } from "@openforis/arena-core";

import {
  useRequestCameraPermission,
  useRequestMediaLibraryPermission,
  useToast,
} from "hooks";

import { useConfirm } from "state/confirm";
import { Files, ImageUtils } from "utils";

import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";

const mediaTypesByFileType = {
  [NodeDefFileType.image]: ImagePicker.MediaTypeOptions.Images,
  [NodeDefFileType.video]: ImagePicker.MediaTypeOptions.Videos,
};

export const useNodeFileComponent = ({ nodeDef, nodeUuid }) => {
  const toaster = useToast();
  const confirm = useConfirm();

  const { request: requestCameraPermission } = useRequestCameraPermission();

  const { request: requestMediaLibraryPermission } =
    useRequestMediaLibraryPermission();

  const { fileType = NodeDefFileType.other, maxSize: maxSizeMB = 10 } =
    nodeDef.props;
  const maxSize = maxSizeMB * Math.pow(1024, 2); // nodeDef maxSize is in MB

  const mediaTypes =
    mediaTypesByFileType[fileType] ?? ImagePicker.MediaTypeOptions.All;

  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });
  const [resizing, setResizing] = useState(false);

  const onFileSelected = useCallback(
    async (result) => {
      const { assets, canceled } = result;
      if (canceled) return;

      const asset = assets?.[0];
      if (!asset) return;

      const { name: assetFileName, uri: sourceFileUri } = asset;

      const fileName = assetFileName ?? Files.getNameFromUri(sourceFileUri);

      const { size: sourceFileSize } = await Files.getInfo(sourceFileUri);

      let fileUri = sourceFileUri;
      let fileSize = sourceFileSize;

      if (fileType === NodeDefFileType.image && sourceFileSize > maxSize) {
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
          });
        }
        setResizing(false);
      }
      const valueUpdated = { fileUuid: UUIDs.v4(), fileName, fileSize };
      await updateNodeValue({ value: valueUpdated, fileUri });
    },
    [fileType, maxSize, toaster, updateNodeValue]
  );

  const onFileChoosePress = useCallback(async () => {
    if (!(await requestMediaLibraryPermission())) return;

    const result =
      fileType === NodeDefFileType.other
        ? await DocumentPicker.getDocumentAsync()
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            mediaTypes,
          });
    onFileSelected(result);
  }, [requestMediaLibraryPermission, fileType, mediaTypes, onFileSelected]);

  const onOpenCameraPress = useCallback(async () => {
    if (!(await requestCameraPermission())) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes });
    onFileSelected(result);
  }, [onFileSelected, requestCameraPermission, mediaTypes]);

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
