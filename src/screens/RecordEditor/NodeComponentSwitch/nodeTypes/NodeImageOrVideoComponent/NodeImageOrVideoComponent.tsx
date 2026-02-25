import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import {
  Button,
  DeleteIconButton,
  HView,
  IconButton,
  Loader,
  VView,
  View,
} from "components";
import { ImageOrVideoValuePreview } from "screens/RecordEditor/NodeValuePreview/ImageOrVideoValuePreview";
import { log } from "utils";
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

type NodeImageOrVideoComponentProps = {
  nodeDef: any;
  nodeUuid?: string;
};

export const NodeImageOrVideoComponent = (
  props: NodeImageOrVideoComponentProps,
) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeImageOrVideoComponent for ${nodeDef.props.name}`);

  const { fileType = NodeDefFileType.other } = nodeDef.props;
  const fileChooseTextKeySuffix = fileChooseTextKeySuffixByFileType[fileType];

  const {
    nodeValue,
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
        {!resizing && nodeValue && (
          <ImageOrVideoValuePreview nodeDef={nodeDef} value={nodeValue} />
        )}
      </View>
      <VView style={styles.buttonsContainer}>
        {nodeValue && NodeDefs.isSingle(nodeDef) && (
          <>
            {fileType === NodeDefFileType.image && (
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
