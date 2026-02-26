import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable } from "react-native";
import type { GestureResponderEvent, LayoutChangeEvent } from "react-native";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { HView, IconButton, ProgressBar, Text } from "components";
import { Files } from "utils";

import * as AudioUtils from "./AudioUtils";
import styles from "./AudioPlaybackStyles";

type AudioPlaybackProps = {
  fileUri: string | null;
};

export const AudioPlayback = memo((props: AudioPlaybackProps) => {
  const { fileUri } = props;
  const toaster = useToast();
  const { t } = useTranslation();
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);

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

  const onSharePress = useCallback(async () => {
    if (!fileUri) {
      return;
    }

    let errorMessage = null;
    try {
      if (await Files.isSharingAvailable()) {
        const dialogTitle = t("common:shareFile");
        await Files.shareFile({ url: fileUri, dialogTitle });
      } else {
        errorMessage = t("appErrors:fileSharingNotAvailable");
      }
    } catch (error) {
      errorMessage = String(error);
    }
    if (errorMessage) {
      toaster("common:somethingWentWrong", { error: errorMessage });
    }
  }, [fileUri, t, toaster]);

  const audioDuration = useMemo(
    () => AudioUtils.formatRecordingDuration(duration * 1000, null),
    [duration],
  );

  const elapsedDuration = useMemo(
    () => AudioUtils.formatRecordingDuration(currentTime * 1000, null),
    [currentTime],
  );

  const playbackProgress = useMemo(() => {
    if (duration <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  const canStopPlayback = playing || currentTime > 0;

  useEffect(() => {
    let cancelled = false;

    const fetchFileSize = async () => {
      if (!fileUri) {
        setFileSizeBytes(null);
        return;
      }

      try {
        const size = await Files.getSize(fileUri);
        if (!cancelled) {
          setFileSizeBytes(size);
        }
      } catch {
        if (!cancelled) {
          setFileSizeBytes(null);
        }
      }
    };

    void fetchFileSize();

    return () => {
      cancelled = true;
    };
  }, [fileUri]);

  const fileSize = useMemo(
    () =>
      typeof fileSizeBytes === "number" && fileSizeBytes > 0
        ? Files.toHumanReadableFileSize(fileSizeBytes)
        : null,
    [fileSizeBytes],
  );

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
      {!!fileSize && (
        <HView style={styles.fileInfoContainer} transparent>
          <Text>{fileSize}</Text>
          <IconButton icon="share-variant" onPress={onSharePress} size={20} />
        </HView>
      )}
    </>
  );
});

AudioPlayback.displayName = "AudioPlayback";
