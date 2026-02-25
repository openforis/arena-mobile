import { NodeDefs } from "@openforis/arena-core";

import { AudioEqualizer, AudioPlayback } from "components/audio";
import { Button, DeleteIconButton, HView, IconButton, VView } from "components";
import { log } from "utils";

import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeAudioComponent } from "./useNodeAudioComponent";
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

  return (
    <HView style={styles.container}>
      <VView style={styles.previewContainer}>
        <AudioEqualizer
          audioRecorder={audioRecorder}
          audioRecording={audioRecording}
          audioRecordingInProgress={audioRecordingInProgress}
          audioRecordingPaused={audioRecordingPaused}
        />

        {!!nodeValue && <AudioPlayback fileUri={fileUri} />}
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
              textKey="dataEntry:fileAttribute.selectAudio"
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
