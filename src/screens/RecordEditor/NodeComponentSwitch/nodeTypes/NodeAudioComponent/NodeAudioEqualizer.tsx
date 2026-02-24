import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import { HView, View } from "components";

import styles from "./NodeAudioEqualizerStyles";

type NodeAudioEqualizerProps = {
  audioMetering: number | null;
  audioRecordingDurationMillis: number;
  audioRecording: boolean;
  audioRecordingInProgress: boolean;
  audioRecordingPaused: boolean;
};

const BAR_COUNT = 72;
const STEP_MILLIS = 120;

const toMeterLevel = (audioMetering: number | null): number => {
  if (audioMetering == null) {
    return 0;
  }
  const level = (audioMetering + 60) / 60;
  return Math.max(0, Math.min(1, level));
};

export const NodeAudioEqualizer = (props: NodeAudioEqualizerProps) => {
  const {
    audioMetering,
    audioRecordingDurationMillis,
    audioRecording,
    audioRecordingInProgress,
    audioRecordingPaused,
  } = props;
  const theme = useTheme();

  const meterLevelNormalized = useMemo(() => {
    if (!audioRecording || audioRecordingPaused) {
      return 0;
    }
    return toMeterLevel(audioMetering);
  }, [audioMetering, audioRecording, audioRecordingPaused]);

  const equalizerBars = useMemo(() => {
    const minHeight = 5;
    const maxHeight = 44;
    const phase = Math.floor(audioRecordingDurationMillis / STEP_MILLIS);

    return Array.from({ length: BAR_COUNT }).map((_, index) => {
      const wave = Math.abs(Math.sin((index + phase) * 0.55));
      const noise = Math.abs(Math.sin((index + phase * 1.7) * 1.1));
      const sample =
        meterLevelNormalized * (0.2 + 0.8 * (0.75 * wave + 0.25 * noise));

      const trailOpacity = 0.2 + 0.8 * ((index + 1) / BAR_COUNT);
      const height = minHeight + sample * maxHeight;
      const opacity = audioRecordingPaused ? 0.25 : trailOpacity;

      return (
        <View
          key={index}
          style={[
            styles.equalizerBar,
            { backgroundColor: theme.colors.primary, height, opacity },
          ]}
          transparent
        />
      );
    });
  }, [
    audioRecordingDurationMillis,
    audioRecordingPaused,
    meterLevelNormalized,
    theme.colors.primary,
  ]);

  if (!audioRecordingInProgress) {
    return null;
  }

  return (
    <View style={styles.equalizerWrapper} transparent>
      <HView style={styles.equalizerContainer} transparent>
        {equalizerBars}
      </HView>
      <View
        style={[styles.playhead, { backgroundColor: theme.colors.primary }]}
        transparent
      />
    </View>
  );
};
