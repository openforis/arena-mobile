import { useCallback, useMemo, useState } from "react";
import { TouchableHighlight } from "react-native";

import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import { IconButton, Image, ImagePreviewDialog, Text, VView } from "components";
import { RecordFileService } from "service";
import { SurveySelectors } from "state";
import { Files } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

import styles from "./imageOrVideoValuePreviewStyles";

export const ImageOrVideoValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;

  const surveyId = SurveySelectors.useCurrentSurveyId();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const { fileName: valueFileName, fileNameCalculated, fileUuid } = value || {};

  const fileName = fileNameCalculated ?? valueFileName;

  const fileUri = useMemo(
    () =>
      fileUuid
        ? RecordFileService.getRecordFileUri({ surveyId, fileUuid })
        : null,
    [fileUuid, surveyId],
  );

  const imageSource = useMemo(
    () =>
      fileType === NodeDefFileType.image && fileUri
        ? { uri: fileUri }
        : undefined,
    [fileType, fileUri],
  );

  const onFileOpenPress = useCallback(async () => {
    const mimeType = Files.getMimeTypeFromName(fileName);
    await Files.shareFile({ url: fileUri!, mimeType });
  }, [fileName, fileUri]);

  const onImagePreviewPress = useCallback(() => {
    setImagePreviewOpen(true);
  }, []);

  const closeImagePreview = useCallback(() => {
    setImagePreviewOpen(false);
  }, []);

  if (!fileUri) return null;

  return (
    <>
      {fileType === NodeDefFileType.image ? (
        <TouchableHighlight onPress={onImagePreviewPress}>
          <Image source={imageSource} style={styles.image} />
        </TouchableHighlight>
      ) : (
        <VView>
          <IconButton icon="file-outline" onPress={onFileOpenPress} size={40} />
          <Text>{fileName}</Text>
        </VView>
      )}
      {imagePreviewOpen && (
        <ImagePreviewDialog
          fileName={fileName}
          imageUri={fileUri}
          onClose={closeImagePreview}
          showGeotagInfo={NodeDefs.isGeotagInformationShown(nodeDef)}
        />
      )}
    </>
  );
};
