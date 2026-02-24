import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import { HView, View } from "components";

import styles from "./NodeAudioEqualizerStyles";

type NodeAudioEqualizerProps = {
  audioMetering: number | null;
  audioRecording: boolean;
  audioRecordingInProgress: boolean;
  audioRecordingPaused: boolean;
};

export const NodeAudioEqualizer = (props: NodeAudioEqualizerProps) => {
  const {
    audioMetering,
    audioRecording,
    audioRecordingInProgress,
    audioRecordingPaused,
  } = props;
  const theme = useTheme();

  const meterLevelNormalized = useMemo(() => {
    if (!audioRecording || audioRecordingPaused || audioMetering == null) {
      return 0;
    }
    const level = (audioMetering + 60) / 60;
    return Math.max(0, Math.min(1, level));
  }, [audioMetering, audioRecording, audioRecordingPaused]);

  const equalizerBars = useMemo(() => {
    const weights = [0.45, 0.7, 0.95, 0.7, 0.45];
    const minHeight = 6;
    const maxHeight = 42;
    return weights.map((weight, index) => {
      const height = minHeight + meterLevelNormalized * maxHeight * weight;
      return (
        <View
          key={index}
          style={[
            styles.equalizerBar,
            { backgroundColor: theme.colors.primary, height },
          ]}
          transparent
        />
      );
    });
  }, [meterLevelNormalized, theme.colors.primary]);

  if (!audioRecordingInProgress) {
    return null;
  }

  return <HView style={styles.equalizerContainer}>{equalizerBars}</HView>;
};
