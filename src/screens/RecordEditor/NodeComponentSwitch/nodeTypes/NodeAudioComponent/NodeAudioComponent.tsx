import { NodeDefs } from "@openforis/arena-core";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback } from "react";

import {
  Button,
  DeleteIconButton,
  HView,
  IconButton,
  Text,
  VView,
} from "components";
import { NodeComponentProps } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/nodeComponentPropTypes";
import { log } from "utils";

import styles from "./styles";
import { useNodeAudioComponent } from "./useNodeAudioComponent";

export const NodeAudioComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeAudioComponent for ${nodeDef.props.name}`);

  const {
    audioRecording,
    fileName,
    fileUri,
    nodeValue,
    onDeletePress,
    onFileChoosePress,
    onStartAudioRecordingPress,
    onStopAudioRecordingPress,
  } = useNodeAudioComponent({ nodeUuid });

  const audioPlayer = useAudioPlayer(fileUri ?? null);
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const onPlaybackPress = useCallback(async () => {
    if (!fileUri) return;

    if (playerStatus.playing) {
      audioPlayer.pause();
      return;
    }

    if (
      playerStatus.duration > 0 &&
      playerStatus.currentTime >= playerStatus.duration
    ) {
      await audioPlayer.seekTo(0);
    }
    audioPlayer.play();
  }, [
    audioPlayer,
    fileUri,
    playerStatus.currentTime,
    playerStatus.duration,
    playerStatus.playing,
  ]);

  return (
    <HView style={styles.container}>
      <VView style={styles.previewContainer}>
        {!!nodeValue && (
          <>
            <IconButton
              icon={playerStatus.playing ? "pause" : "play"}
              onPress={onPlaybackPress}
              size={40}
            />
            {!!fileName && <Text>{fileName}</Text>}
          </>
        )}
      </VView>

      <VView style={styles.buttonsContainer}>
        {nodeValue && NodeDefs.isSingle(nodeDef) && (
          <DeleteIconButton onPress={onDeletePress} />
        )}

        {!nodeValue && (
          <>
            <IconButton
              icon={audioRecording ? "stop-circle" : "microphone"}
              onPress={
                audioRecording
                  ? onStopAudioRecordingPress
                  : onStartAudioRecordingPress
              }
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
      </VView>
    </HView>
  );
};
