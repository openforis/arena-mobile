import { NodeDefs } from "@openforis/arena-core";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useMemo } from "react";

import {
  Button,
  DeleteIconButton,
  HView,
  IconButton,
  ProgressBar,
  Text,
  VView,
} from "components";
import { NodeComponentProps } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/nodeComponentPropTypes";
import { Files, log } from "utils";

import { useNodeAudioComponent } from "./useNodeAudioComponent";
import { NodeAudioEqualizer } from "./NodeAudioEqualizer";
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

  const formatDuration = useCallback((durationSeconds: number) => {
    const totalSeconds = Math.round(durationSeconds);
    if (totalSeconds <= 0) {
      return null;
    }

    const seconds = totalSeconds % 60;
    const minutesTotal = Math.floor(totalSeconds / 60);
    const minutes = minutesTotal % 60;
    const hours = Math.floor(minutesTotal / 60);

    const secondsStr = String(seconds).padStart(2, "0");
    const minutesStr = String(minutes).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${minutesStr}:${secondsStr}`;
    }

    return `${minutesStr}:${secondsStr}`;
  }, []);

  const audioDuration = useMemo(() => {
    return formatDuration(playerStatus.duration ?? 0);
  }, [formatDuration, playerStatus.duration]);

  const elapsedDuration = useMemo(() => {
    return formatDuration(playerStatus.currentTime ?? 0);
  }, [formatDuration, playerStatus.currentTime]);

  const fileSize = useMemo(
    () =>
      nodeValue?.fileSize
        ? Files.toHumanReadableFileSize(nodeValue.fileSize)
        : null,
    [nodeValue],
  );

  const playbackProgress = useMemo(() => {
    const duration = playerStatus.duration ?? 0;
    const currentTime = playerStatus.currentTime ?? 0;

    if (duration <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(1, currentTime / duration));
  }, [playerStatus.currentTime, playerStatus.duration]);

  const audioInfo = useMemo(() => {
    const parts = [];
    if (playerStatus.playing && elapsedDuration) {
      parts.push(elapsedDuration);
    }
    if (audioDuration) {
      if (parts.length > 0) {
        parts.push("/");
      }
      parts.push(audioDuration);
    }
    return parts.length > 0 ? parts.join(" ") : (audioDuration ?? fileSize);
  }, [audioDuration, elapsedDuration, fileSize, playerStatus.playing]);

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
          <>
            <IconButton
              icon={playerStatus.playing ? "pause" : "play"}
              onPress={onPlaybackPress}
              size={40}
            />
            {!!audioDuration && (
              <ProgressBar
                progress={playbackProgress}
                style={styles.playbackProgressBar}
              />
            )}
            {!!audioInfo && <Text>{audioInfo}</Text>}
            {!!fileSize && <Text>{fileSize}</Text>}
          </>
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
