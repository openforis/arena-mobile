import { useCallback, useMemo, useState } from "react";

import { usePositionTrackingSummary } from "hooks/usePositionTracking";
import { PositionTrackingStatus } from "state";
import { AppThemeColors, useAppTheme } from "theme";

import styles from "./styles";

export const statusIcons: Record<PositionTrackingStatus, string> = {
  [PositionTrackingStatus.idle]: "map-marker-path",
  [PositionTrackingStatus.starting]: "map-marker-path",
  [PositionTrackingStatus.tracking]: "record-circle-outline",
  [PositionTrackingStatus.paused]: "pause-circle-outline",
};

export type Summary = ReturnType<typeof usePositionTrackingSummary>;

export const useExpanded = () => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(
    () => setExpanded((expandedPrev) => !expandedPrev),
    [],
  );
  return { expanded, toggleExpanded };
};

// green only while points are being collected, so the user can tell it at a glance
export enum BarTone {
  collecting = "collecting",
  notCollecting = "notCollecting",
  error = "error",
}

type ThemeColors = AppThemeColors;

const getToneColors = (colors: ThemeColors, tone: BarTone) => {
  switch (tone) {
    case BarTone.collecting:
      return [colors.secondary, colors.onSecondary] as const;
    case BarTone.error:
      return [colors.errorContainer, colors.onErrorContainer] as const;
    default:
      return [colors.surfaceVariant, colors.onSurfaceVariant] as const;
  }
};

export const useBarColors = (tone: BarTone) => {
  const { colors } = useAppTheme();
  return useMemo(() => {
    const [backgroundColor, textColor] = getToneColors(colors, tone);
    return {
      containerStyle: [styles.container, { backgroundColor }],
      detailsStyle: [styles.details, { backgroundColor: colors.surface }],
      textColor,
    };
  }, [colors, tone]);
};
