import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import {
  AlertIcon,
  Button,
  DeleteIconButton,
  HView,
  IconButton,
  Loader,
  Text,
  VView,
  View,
} from "components";
import { ImageOrVideoValuePreview } from "screens/RecordEditor/NodeValuePreview/ImageOrVideoValuePreview";
import { log } from "utils";

import { useEffectiveTheme } from "hooks";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeFileComponent } from "./useNodeFileComponent";
import styles from "./styles";

const fileChooseTextKeySuffixByFileType: Record<string, string> = {
  [NodeDefFileType.image]: "Picture",
  [NodeDefFileType.video]: "Video",
  [NodeDefFileType.other]: "File",
};

const cameraButtonAvailableByFileType: Record<string, boolean> = {
  [NodeDefFileType.image]: true,
  [NodeDefFileType.video]: true,
};

export const NodeImageOrVideoComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(
    `rendering NodeImageOrVideoComponent for ${NodeDefs.getName(nodeDef)}`,
  );

  const { fileType = NodeDefFileType.other } = nodeDef.props;
  const fileChooseTextKeySuffix = fileChooseTextKeySuffixByFileType[fileType];

  const theme = useEffectiveTheme();

  const {
    nodeValue,
    fileMissing,
    onDeletePress,
    onRotatePress,
    onOpenCameraPress,
    onFileChoosePress,
    resizing,
  } = useNodeFileComponent({ nodeDef, nodeUuid });

  return (
    <HView style={styles.container}>
      <View style={styles.previewContainer}>
        {resizing && <Loader />}
        {!resizing && nodeValue && !fileMissing && (
          <ImageOrVideoValuePreview nodeDef={nodeDef} value={nodeValue} />
        )}
        {!resizing && nodeValue && fileMissing && (
          <HView style={styles.fileMissingContainer}>
            <AlertIcon hasErrors />
            <Text
              textKey="dataEntry:fileAttribute.fileMissing"
              style={{ color: theme.colors.error }}
            />
          </HView>
        )}
      </View>
      <VView style={styles.buttonsContainer}>
        {nodeValue && NodeDefs.isSingle(nodeDef) && (
          <>
            {fileType === NodeDefFileType.image && !fileMissing && (
              <Button
                icon="rotate-right"
                onPress={onRotatePress}
                textKey="dataEntry:fileAttributeImage.rotate"
              />
            )}
            <DeleteIconButton onPress={onDeletePress} />
          </>
        )}
        {!nodeValue && (
          <>
            {cameraButtonAvailableByFileType[fileType] && (
              <IconButton
                icon="camera"
                onPress={onOpenCameraPress}
                style={styles.cameraButton}
                size={40}
              />
            )}
            <Button
              icon="view-gallery"
              onPress={onFileChoosePress}
              textKey={`dataEntry:fileAttribute.select${fileChooseTextKeySuffix}`}
            />
          </>
        )}
      </VView>
    </HView>
  );
};
