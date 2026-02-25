import { NodeDefs } from "@openforis/arena-core";
import { useMemo } from "react";

import { Button, DeleteIconButton, HView, IconButton, VView } from "components";
import { NodeComponentProps } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/nodeComponentPropTypes";
import { Files, log } from "utils";

import { useNodeAudioComponent } from "./useNodeAudioComponent";
import { NodeAudioEqualizer } from "./NodeAudioEqualizer";
import { NodeAudioPlayback } from "./NodeAudioPlayback";
import styles from "./styles";

export const NodeAudioComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeAudioComponent for ${nodeDef.props.name}`);

  const {
    audioRecorder,
    audioRecording,
    audioRecordingInProgress,
    audioRecordingPaused,
    fileUri,
    nodeValue,
    onDeletePress,
    onFileChoosePress,
    onPauseAudioRecordingPress,
    onResumeAudioRecordingPress,
    onStartAudioRecordingPress,
    onStopAudioRecordingPress,
  } = useNodeAudioComponent({ nodeUuid });

  const fileSize = useMemo(
    () =>
      nodeValue?.fileSize
        ? Files.toHumanReadableFileSize(nodeValue.fileSize)
        : null,
    [nodeValue],
  );

  return (
    <HView style={styles.container}>
      <VView style={styles.previewContainer}>
        <NodeAudioEqualizer
          audioRecorder={audioRecorder}
          audioRecording={audioRecording}
          audioRecordingInProgress={audioRecordingInProgress}
          audioRecordingPaused={audioRecordingPaused}
        />

        {!!nodeValue && (
          <NodeAudioPlayback fileSize={fileSize} fileUri={fileUri} />
        )}
      </VView>

      <VView style={styles.buttonsContainer}>
        {nodeValue && NodeDefs.isSingle(nodeDef) && (
          <DeleteIconButton onPress={onDeletePress} />
        )}

        {!nodeValue && !audioRecordingInProgress && (
          <>
            <IconButton
              icon="microphone"
              onPress={onStartAudioRecordingPress}
              style={styles.audioRecorderButton}
              size={40}
            />
            <Button
              icon="view-gallery"
              onPress={onFileChoosePress}
              textKey="dataEntry:fileAttribute.chooseAudio"
            />
          </>
        )}

        {!nodeValue && audioRecordingInProgress && (
          <>
            <IconButton
              icon={audioRecording ? "pause" : "record-circle-outline"}
              onPress={
                audioRecording
                  ? onPauseAudioRecordingPress
                  : onResumeAudioRecordingPress
              }
              style={styles.audioRecorderButton}
              size={40}
            />
            <IconButton
              icon="stop-circle"
              onPress={onStopAudioRecordingPress}
              style={styles.audioRecorderButton}
              size={40}
            />
          </>
        )}
      </VView>
    </HView>
  );
};
