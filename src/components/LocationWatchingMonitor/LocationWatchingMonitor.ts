// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
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

export const LocationWatchingMonitor = (props: any) => {
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
    // @ts-expect-error TS(2709): Cannot use namespace 'VView' as a type.
    <VView style={styles.outerContainer}>
      {watchingLocation && (
        <>
          // @ts-expect-error TS(7027): Unreachable code detected.
          <FieldSet headerKey="dataEntry:coordinate.accuracy">
            // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
            <HView>
              // @ts-expect-error TS(2709): Cannot use namespace 'View' as a type.
              <View style={styles.accuracyProgressBarWrapper}>
                // @ts-expect-error TS(2709): Cannot use namespace 'AccuracyProgressBar' as a ty... Remove this comment to see the full error message
                <AccuracyProgressBar
                  // @ts-expect-error TS(2304): Cannot find name 'accuracy'.
                  accuracy={Number(locationAccuracy)}
                  // @ts-expect-error TS(2304): Cannot find name 'accuracyThreshold'.
                  accuracyThreshold={locationAccuracyThreshold}
                />
              </View>
              // @ts-expect-error TS(2304): Cannot find name 'm'.
              <Text>{locationAccuracyFormatted} m</Text>
            </HView>
          </FieldSet>
          <ElapsedTimeProgressBar
            // @ts-expect-error TS(2304): Cannot find name 'elapsedTime'.
            elapsedTime={locationWatchElapsedTime}
            // @ts-expect-error TS(2304): Cannot find name 'elapsedTimeThreshold'.
            elapsedTimeThreshold={locationWatchTimeout}
          />
        </>
      )}
      // @ts-expect-error TS(2304): Cannot find name 'watchingLocation'.
      {!watchingLocation && (
        // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
        <Button
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="play"
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={onStart}
          // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
          style={styles.button}
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
          textKey="dataEntry:coordinate.getLocation"
        />
      )}
      // @ts-expect-error TS(2304): Cannot find name 'watchingLocation'.
      {watchingLocation && (
        // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
        <Button
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="stop"
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={onStop}
          // @ts-expect-error TS(2304): Cannot find name 'style'.
          style={styles.button}
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
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
