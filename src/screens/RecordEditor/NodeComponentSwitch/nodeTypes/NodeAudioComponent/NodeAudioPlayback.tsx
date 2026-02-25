import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { memo, useCallback, useMemo, useRef } from "react";
import { Pressable } from "react-native";
import type { GestureResponderEvent, LayoutChangeEvent } from "react-native";

import { HView, IconButton, ProgressBar, Text, View } from "components";

import * as AudioUtils from "./AudioUtils";
import styles from "./styles";

type NodeAudioPlaybackProps = {
  fileSize: string | null;
  fileUri: string | null;
};

export const NodeAudioPlayback = memo((props: NodeAudioPlaybackProps) => {
  const { fileSize, fileUri } = props;

  const audioPlayer = useAudioPlayer(fileUri ?? null);
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const { currentTime, duration, playing } = playerStatus;

  const onPlaybackPress = useCallback(async () => {
    if (!fileUri) return;

    if (playing) {
      audioPlayer.pause();
      return;
    }

    if (duration > 0 && currentTime >= duration) {
      await audioPlayer.seekTo(0);
    }
    audioPlayer.play();
  }, [audioPlayer, fileUri, currentTime, duration, playing]);

  const onStopPlaybackPress = useCallback(async () => {
    audioPlayer.pause();
    await audioPlayer.seekTo(0);
  }, [audioPlayer]);

  const audioDuration = useMemo(
    () => AudioUtils.formatRecordingDuration(duration * 1000),
    [duration],
  );

  const elapsedDuration = useMemo(
    () => AudioUtils.formatRecordingDuration(currentTime * 1000),
    [currentTime],
  );

  const playbackProgress = useMemo(() => {
    if (duration <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  const canStopPlayback = playing || currentTime > 0;

  const hasPlaybackDuration = useMemo(() => {
    return (
      typeof duration === "number" && Number.isFinite(duration) && duration > 0
    );
  }, [duration]);

  const progressBarWidthRef = useRef(0);

  const onProgressBarLayout = useCallback((event: LayoutChangeEvent) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  const onProgressBarPress = useCallback(
    async (event: GestureResponderEvent) => {
      if (!hasPlaybackDuration) {
        return;
      }
      const width = progressBarWidthRef.current;
      if (width <= 0 || duration <= 0) {
        return;
      }
      const tapX = event.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, tapX / width));
      await audioPlayer.seekTo(duration * ratio);
    },
    [audioPlayer, hasPlaybackDuration, duration],
  );

  const audioInfo = useMemo(() => {
    const parts = [];
    if (elapsedDuration) {
      parts.push(elapsedDuration);
    }
    if (audioDuration) {
      if (parts.length > 0) {
        parts.push("/");
      }
      parts.push(audioDuration);
    }
    return parts.length > 0 ? parts.join(" ") : (audioDuration ?? fileSize);
  }, [audioDuration, elapsedDuration, fileSize]);

  return (
    <>
      {playing || canStopPlayback ? (
        <HView style={styles.playbackButtonsContainer} transparent>
          <IconButton
            icon={playing ? "pause" : "play"}
            onPress={onPlaybackPress}
            size={40}
          />
          {canStopPlayback && (
            <IconButton
              icon="stop-circle"
              onPress={onStopPlaybackPress}
              size={40}
            />
          )}
        </HView>
      ) : (
        <IconButton icon="play" onPress={onPlaybackPress} size={40} />
      )}
      <Pressable
        onLayout={onProgressBarLayout}
        onPress={onProgressBarPress}
        style={styles.playbackProgressBarContainer}
      >
        <ProgressBar
          indeterminate={!hasPlaybackDuration && playing}
          progress={playbackProgress}
          style={styles.playbackProgressBar}
        />
      </Pressable>
      {!!audioInfo && <Text>{audioInfo}</Text>}
      {!!fileSize && <Text>{fileSize}</Text>}
    </>
  );
});

NodeAudioPlayback.displayName = "NodeAudioPlayback";
