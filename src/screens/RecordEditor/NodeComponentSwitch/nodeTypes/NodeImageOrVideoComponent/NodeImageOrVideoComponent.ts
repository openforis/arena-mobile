// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import {
  Button,
  DeleteIconButton,
  HView,
  IconButton,
  Loader,
  VView,
  View,
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'screens/RecordEditor/NodeValue... Remove this comment to see the full error message
import { ImageOrVideoValuePreview } from "screens/RecordEditor/NodeValuePreview/ImageOrVideoValuePreview";
import { useNodeFileComponent } from "./useNodeFileComponent";

import styles from "./styles";

const fileChooseTextKeySuffixByFileType = {
  [NodeDefFileType.audio]: "Audio",
  [NodeDefFileType.image]: "Picture",
  [NodeDefFileType.video]: "Video",
  [NodeDefFileType.other]: "File",
};

const cameraButtonAvailableByFileType = {
  [NodeDefFileType.image]: true,
  [NodeDefFileType.video]: true,
};

export const NodeImageOrVideoComponent = (props: any) => {
  const { nodeDef, nodeUuid } = props;

  if (__DEV__) {
    console.log(
      `rendering NodeImageOrVideoComponent for ${nodeDef.props.name}`
    );
  }

  const { fileType = NodeDefFileType.other } = nodeDef.props;
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const fileChooseTextKeySuffix = fileChooseTextKeySuffixByFileType[fileType];

  const {
    nodeValue,
    onDeletePress,
    onOpenCameraPress,
    onFileChoosePress,
    resizing,
  } = useNodeFileComponent({ nodeDef, nodeUuid });

  return (
    // @ts-expect-error TS(2304): Cannot find name 'style'.
    <HView style={styles.container}>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <View style={styles.previewContainer}>
        {resizing && <Loader />}
        {!resizing && nodeValue && (
          // @ts-expect-error TS(2304): Cannot find name 'value'.
          <ImageOrVideoValuePreview nodeDef={nodeDef} value={nodeValue} />
        )}
      </View>

      // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
      <VView style={styles.buttonsContainer}>
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        {nodeValue && NodeDefs.isSingle(nodeDef) && (
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          <DeleteIconButton onPress={onDeletePress} />
        )}
        // @ts-expect-error TS(2304): Cannot find name 'nodeValue'.
        {!nodeValue && (
          <>
            // @ts-expect-error TS(2304): Cannot find name 'fileType'.
            {cameraButtonAvailableByFileType[fileType] && (
              <IconButton
                // @ts-expect-error TS(2304): Cannot find name 'icon'.
                icon="camera"
                // @ts-expect-error TS(2304): Cannot find name 'onPress'.
                onPress={onOpenCameraPress}
                style={styles.cameraButton}
                // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
                size={40}
              />
            )}
            <Button
              // @ts-expect-error TS(2304): Cannot find name 'icon'.
              icon="view-gallery"
              // @ts-expect-error TS(2304): Cannot find name 'onPress'.
              onPress={onFileChoosePress}
              // @ts-expect-error TS(2304): Cannot find name 'textKey'.
              textKey={`dataEntry:fileAttribute.choose${fileChooseTextKeySuffix}`}
            />
          </>
        )}
      </VView>
    </HView>
  );
};

NodeImageOrVideoComponent.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
};
