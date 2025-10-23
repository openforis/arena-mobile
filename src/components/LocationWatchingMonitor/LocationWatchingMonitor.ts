import PropTypes from "prop-types";

import { FieldSet } from "../FieldSet";
import { Button } from "../Button";
import { HView } from "../HView";
import { Text } from "../Text";
import { View } from "../View";
import { VView } from "../VView";
import { AccuracyProgressBar } from "./AccuracyProgressBar";
import { ElapsedTimeProgressBar } from "./ElapsedTimeProgressBar";

import styles from "./styles";

export const LocationWatchingMonitor = (props) => {
  const {
    locationAccuracy,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchTimeout,
    onStart,
    onStop,
    watchingLocation,
  } = props;

  if (__DEV__) {
    console.log(`rendering LocationWatchingMonitor`);
  }

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
        <Button
          icon="play"
          onPress={onStart}
          style={styles.button}
          textKey="dataEntry:coordinate.getLocation"
        />
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

LocationWatchingMonitor.propTypes = {
  locationAccuracy: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  locationAccuracyThreshold: PropTypes.number.isRequired,
  locationWatchElapsedTime: PropTypes.number.isRequired,
  locationWatchTimeout: PropTypes.number.isRequired,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  watchingLocation: PropTypes.bool.isRequired,
};
