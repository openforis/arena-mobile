import { useCallback, useEffect, useState } from "react";
import { TouchableHighlight } from "react-native";

import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { IconButton, Image, ImagePreviewDialog, Text, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { RecordFileService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Files } from "utils";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

import styles from "./imageOrVideoValuePreviewStyles";

export const ImageOrVideoValuePreview = (props: any) => {
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
          showGeotagInfo={NodeDefs.isGeotagInformationShown(nodeDef)}
        />
      )}
    </>
  );
};

ImageOrVideoValuePreview.propTypes = NodeValuePreviewPropTypes;
