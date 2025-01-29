import { useCallback, useEffect, useState } from "react";
import { TouchableHighlight } from "react-native";

import { NodeDefFileType } from "@openforis/arena-core";

import { IconButton, Image, ImagePreviewDialog, Text, VView } from "components";
import { RecordFileService } from "service";
import { SurveySelectors } from "state";
import { Files } from "utils";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

import styles from "./imageOrVideoValuePreviewStyles";

export const ImageOrVideoValuePreview = (props) => {
  const { nodeDef, value } = props;

  const { fileType = NodeDefFileType.other } = nodeDef.props;
  const surveyId = SurveySelectors.useCurrentSurveyId();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [fileUri, setFileUri] = useState(null);

  const { fileName: valueFileName, fileNameCalculated, fileUuid } = value || {};

  const fileName = fileNameCalculated ?? valueFileName;

  useEffect(() => {
    const fileUriUpdated = fileUuid
      ? RecordFileService.getRecordFileUri({ surveyId, fileUuid })
      : null;
    setFileUri(fileUriUpdated);
  }, [fileUuid, surveyId]);

  const onFileOpenPress = useCallback(async () => {
    const mimeType = Files.getMimeTypeFromName(fileName);
    await Files.shareFile({ url: fileUri, mimeType });
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
          <Image source={{ uri: fileUri }} style={styles.image} />
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
        />
      )}
    </>
  );
};

ImageOrVideoValuePreview.propTypes = NodeValuePreviewPropTypes;
