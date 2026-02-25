import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { memo, useCallback, useMemo, useRef } from "react";
import { Pressable } from "react-native";
import type { GestureResponderEvent, LayoutChangeEvent } from "react-native";

import { IconButton, ProgressBar, Text, View } from "components";

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

  const audioDuration = useMemo(() => {
    const duration = playerStatus.duration ?? 0;
    return duration > 0
      ? AudioUtils.formatRecordingDuration(duration * 1000)
      : null;
  }, [playerStatus.duration]);

  const elapsedDuration = useMemo(() => {
    const currentTime = playerStatus.currentTime ?? 0;
    return currentTime > 0
      ? AudioUtils.formatRecordingDuration(currentTime * 1000)
      : null;
  }, [playerStatus.currentTime]);

  const playbackProgress = useMemo(() => {
    const duration = playerStatus.duration ?? 0;
    const currentTime = playerStatus.currentTime ?? 0;

    if (duration <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(1, currentTime / duration));
  }, [playerStatus.currentTime, playerStatus.duration]);

  const hasPlaybackDuration = useMemo(() => {
    const duration = playerStatus.duration;
    return (
      typeof duration === "number" && Number.isFinite(duration) && duration > 0
    );
  }, [playerStatus.duration]);

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
      const duration = playerStatus.duration ?? 0;
      if (width <= 0 || duration <= 0) {
        return;
      }

      const tapX = event.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, tapX / width));
      await audioPlayer.seekTo(duration * ratio);
    },
    [audioPlayer, hasPlaybackDuration, playerStatus.duration],
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
      <IconButton
        icon={playerStatus.playing ? "pause" : "play"}
        onPress={onPlaybackPress}
        size={40}
      />
      <Pressable
        onLayout={onProgressBarLayout}
        onPress={onProgressBarPress}
        style={styles.playbackProgressBarContainer}
      >
        <ProgressBar
          indeterminate={!hasPlaybackDuration && playerStatus.playing}
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
