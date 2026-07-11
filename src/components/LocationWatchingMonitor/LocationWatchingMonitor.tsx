import { log } from "utils";
import { GpsSourceSetting } from "model";
import { GpsSourceDescriptor } from "service/externalGps/types";
import { FieldSet } from "../FieldSet";
import { Button } from "../Button";
import { HView } from "../HView";
import { MenuButton } from "../MenuButton";
import { Text } from "../Text";
import { View } from "../View";
import { VView } from "../VView";
import { AccuracyProgressBar } from "./AccuracyProgressBar";
import { ElapsedTimeProgressBar } from "./ElapsedTimeProgressBar";

import styles from "./styles";

type LocationWatchingMonitorProps = {
  availableGpsSources?: GpsSourceDescriptor[];
  locationAccuracy?: number | string | null;
  locationAccuracyThreshold: number;
  locationWatchElapsedTime: number;
  locationWatchTimeout: number;
  onSelectGpsSource?: (sourceId: string) => void;
  onStart: () => void;
  onStop: () => void;
  preferredGpsSourceId?: string;
  watchingLocation: boolean;
};

export const LocationWatchingMonitor = (
  props: LocationWatchingMonitorProps
) => {
  const {
    availableGpsSources = [],
    locationAccuracy,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchTimeout,
    onSelectGpsSource,
    onStart,
    onStop,
    preferredGpsSourceId,
    watchingLocation,
  } = props;

  log.debug(`rendering LocationWatchingMonitor`);

  // Only worth showing a source picker once there's an actual choice - i.e. at
  // least one recognized external GPS device is bonded, in addition to internal.
  // Hidden while watching to avoid swapping source mid-capture (would confuse
  // in-flight location averaging).
  const gpsSourceMenuVisible =
    !watchingLocation && !!onSelectGpsSource && availableGpsSources.length > 1;

  const gpsSourceMenuItems = gpsSourceMenuVisible
    ? [
        {
          key: GpsSourceSetting.auto,
          label: "settings:preferredGpsSourceId.auto",
          icon: preferredGpsSourceId === GpsSourceSetting.auto ? "check" : undefined,
          onPress: () => onSelectGpsSource!(GpsSourceSetting.auto),
        },
        ...availableGpsSources.map((source) => ({
          key: source.id,
          label:
            source.type === "internal"
              ? "settings:preferredGpsSourceId.internal"
              : source.label,
          icon: preferredGpsSourceId === source.id ? "check" : undefined,
          onPress: () => onSelectGpsSource!(source.id),
        })),
      ]
    : [];

  const locationAccuracyFormatted =
    typeof locationAccuracy === "string"
      ? locationAccuracy
      : locationAccuracy?.toFixed?.(2);

  return (
    <VView style={styles.outerContainer}>
      {watchingLocation && (
        <>
          <FieldSet headerKey="dataEntry:coordinate.accuracy">
            <HView>
              <View style={styles.accuracyProgressBarWrapper}>
                <AccuracyProgressBar
                  accuracy={Number(locationAccuracy)}
                  accuracyThreshold={locationAccuracyThreshold}
                />
              </View>
              <Text>{locationAccuracyFormatted} m</Text>
            </HView>
          </FieldSet>
          <ElapsedTimeProgressBar
            elapsedTime={locationWatchElapsedTime}
            elapsedTimeThreshold={locationWatchTimeout}
          />
        </>
      )}
      {!watchingLocation && (
        <HView>
          <Button
            icon="play"
            onPress={onStart}
            style={styles.button}
            textKey="dataEntry:coordinate.getLocation"
          />
          {gpsSourceMenuVisible && (
            <MenuButton icon="crosshairs-gps" items={gpsSourceMenuItems} />
          )}
        </HView>
      )}
      {watchingLocation && (
        <Button
          icon="stop"
          onPress={onStop}
          style={styles.button}
          textKey="common:stop"
        />
      )}
    </VView>
  );
};
