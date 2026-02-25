import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useTheme } from "react-native-paper";

import { HView, View } from "components";

import styles from "./NodeAudioEqualizerStyles";

type NodeAudioEqualizerProps = {
  audioRecorder: ReturnType<typeof useAudioRecorder>;
  audioRecording: boolean;
  audioRecordingInProgress: boolean;
  audioRecordingPaused: boolean;
};

const BAR_COUNT = 72;
const STEP_MILLIS = 120;
const HALF_BAR_COUNT = Math.floor(BAR_COUNT / 2);
const EMPTY_HISTORY = Array(HALF_BAR_COUNT).fill(0);

const toMeterLevel = (audioMetering: number | null): number => {
  if (audioMetering == null) {
    return 0;
  }
  const level = (audioMetering + 60) / 60;
  return Math.max(0, Math.min(1, level));
};

export const NodeAudioEqualizer = (props: NodeAudioEqualizerProps) => {
  const {
    audioRecorder,
    audioRecording,
    audioRecordingInProgress,
    audioRecordingPaused,
  } = props;
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const audioRecorderState = useAudioRecorderState(audioRecorder);
  const audioMetering = audioRecorderState.metering ?? null;
  const audioRecordingDurationMillis = audioRecorderState.durationMillis ?? 0;

  const meterLevelNormalized = useMemo(() => {
    if (!audioRecording || audioRecordingPaused) {
      return 0;
    }
    return toMeterLevel(audioMetering);
  }, [audioMetering, audioRecording, audioRecordingPaused]);

  const recordingStep = useMemo(
    () => Math.floor(audioRecordingDurationMillis / STEP_MILLIS),
    [audioRecordingDurationMillis],
  );

  const [meteringHistory, setMeteringHistory] = useState<number[]>(() =>
    EMPTY_HISTORY.slice(),
  );
  const meterLevelRef = useRef(0);

  useEffect(() => {
    meterLevelRef.current = meterLevelNormalized;
  }, [meterLevelNormalized]);

  useEffect(() => {
    if (!audioRecordingInProgress) {
      return;
    }

    const intervalId = setInterval(() => {
      setMeteringHistory((prev) => {
        const nextLevel = audioRecordingPaused ? 0 : meterLevelRef.current;
        return [nextLevel, ...prev.slice(0, HALF_BAR_COUNT - 1)];
      });
    }, STEP_MILLIS);

    return () => {
      clearInterval(intervalId);
    };
  }, [audioRecordingInProgress, audioRecordingPaused]);

  const meteringHistoryForRender = useMemo(
    () => (audioRecordingInProgress ? meteringHistory : EMPTY_HISTORY),
    [audioRecordingInProgress, meteringHistory],
  );

  const equalizerBars = useMemo(() => {
    const minHeight = 4;
    const maxHeight = 44;
    const heightRange = maxHeight - minHeight;
    const phase = recordingStep * 0.75;

    return Array.from({ length: BAR_COUNT }).map((_, index) => {
      const mirroredIndex =
        index < HALF_BAR_COUNT
          ? HALF_BAR_COUNT - index - 1
          : index - HALF_BAR_COUNT;
      const sample = meteringHistoryForRender[mirroredIndex] ?? 0;
      const wavePosition = phase - mirroredIndex * 0.65;
      const wavePrimary = Math.abs(Math.sin(wavePosition));
      const waveSecondary = Math.abs(Math.sin(wavePosition * 0.52 + 1.1));
      const wave = 0.75 * wavePrimary + 0.25 * waveSecondary;
      const envelope = Math.exp(-mirroredIndex / (HALF_BAR_COUNT * 0.36));
      const level = sample * (0.35 + 0.65 * wave) * envelope;
      const height = minHeight + level * heightRange;
      const opacityBase = 0.3 + 0.7 * envelope;
      const opacity = audioRecordingPaused ? 0.22 : opacityBase;

      return (
        <View
          key={index}
          style={[
            styles.equalizerBar,
            { backgroundColor: primaryColor, height, opacity },
          ]}
          transparent
        />
      );
    });
  }, [
    audioRecordingPaused,
    meteringHistoryForRender,
    recordingStep,
    primaryColor,
  ]);

  const playheadStyle = useMemo(
    () => [styles.playhead, { backgroundColor: primaryColor }],
    [primaryColor],
  );

  if (!audioRecordingInProgress) {
    return null;
  }

  return (
    <View style={styles.equalizerWrapper} transparent>
      <HView style={styles.equalizerContainer} transparent>
        {equalizerBars}
      </HView>
      <View style={playheadStyle} transparent />
    </View>
  );
};
