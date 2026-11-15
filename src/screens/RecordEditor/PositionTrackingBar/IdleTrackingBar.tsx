import { Button, HView, Icon, LoadingIcon, Text } from "components";
import { useAppTheme } from "theme";

import styles from "./styles";
import { BarTone, statusIcons, useBarColors } from "./trackingBarUtils";

const getIdleTextKey = ({
  errorKey,
  starting,
}: {
  errorKey: string | null;
  starting: boolean;
}) => {
  if (errorKey) return errorKey;
  return starting
    ? "dataEntry:positionTracking.status.starting"
    : "dataEntry:positionTracking.title";
};

const getStartTextKey = ({
  errorKey,
  hasRecordedTrack,
}: {
  errorKey: string | null;
  hasRecordedTrack: boolean;
}) => {
  if (errorKey) return "dataEntry:positionTracking.retry";
  return hasRecordedTrack
    ? "dataEntry:positionTracking.resume"
    : "dataEntry:positionTracking.start";
};

// tracking not active (or being started): "Start tracking" / "Resume" / "Retry" button;
// "Restart" (deleting the recorded points) when a track has already been recorded
export const IdleTrackingBar = ({
  canStart,
  errorKey,
  hasRecordedTrack,
  onRestart,
  onStart,
  starting,
}: {
  canStart: boolean;
  errorKey: string | null;
  hasRecordedTrack: boolean;
  onRestart: () => void;
  onStart: () => void;
  starting: boolean;
}) => {
  const theme = useAppTheme();
  const { containerStyle, textColor } = useBarColors(
    errorKey ? BarTone.error : BarTone.notCollecting,
  );

  return (
    <HView style={[containerStyle, styles.header]}>
      {starting ? (
        <LoadingIcon />
      ) : (
        <Icon
          source={errorKey ? "alert-circle-outline" : statusIcons.idle}
          color={errorKey ? theme.colors.error : textColor}
        />
      )}
      <Text
        numberOfLines={2}
        style={[styles.headerText, { color: textColor }]}
        variant="labelLarge"
        textKey={getIdleTextKey({ errorKey, starting })}
      />
      {canStart && (
        <Button
          compact
          icon="play"
          mode="text"
          onPress={onStart}
          textKey={getStartTextKey({ errorKey, hasRecordedTrack })}
        />
      )}
      {canStart && hasRecordedTrack && !errorKey && (
        <Button
          compact
          icon="restart"
          mode="text"
          onPress={onRestart}
          textKey="dataEntry:positionTracking.restart"
        />
      )}
    </HView>
  );
};
