import { useCallback, useMemo } from "react";

import { Button, HView, IconButton, Text, VView } from "components";
import {
  usePositionTrackingLiveSegments,
  usePositionTrackingSummary,
} from "hooks/usePositionTracking";
import { PositionTracks } from "model";
import {
  DataEntrySelectors,
  PositionTrackingActions,
  PositionTrackingStatus,
  useAppDispatch,
} from "state";

import { TrackMapView } from "../../../NodeValuePreview/TrackMapView";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

// geo attribute with position tracking enabled: the value is read-only, written only by tracking
export const NodeGeoTrackComponent = (props: NodeComponentProps) => {
  const { nodeUuid } = props;

  const dispatch = useAppDispatch();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();
  const { nodeValue, onDownloadGeoJsonPress } = useNodeGeoComponent(props);

  const summary = usePositionTrackingSummary();
  const { status, nodeUuid: trackedNodeUuid, errorKey } = summary;
  const isTrackedNode = !!nodeUuid && trackedNodeUuid === nodeUuid;
  const trackActive =
    isTrackedNode &&
    (status === PositionTrackingStatus.tracking ||
      status === PositionTrackingStatus.paused);
  const tracking = isTrackedNode && status === PositionTrackingStatus.tracking;

  const liveSegments = usePositionTrackingLiveSegments();
  const valueSegments = useMemo(
    () => PositionTracks.fromFeature(nodeValue),
    [nodeValue],
  );
  const segments = trackActive ? liveSegments : valueSegments;
  const hasPoints = PositionTracks.countPoints(segments) > 0;

  const onStart = useCallback(() => {
    if (nodeUuid) {
      void dispatch(PositionTrackingActions.startTracking({ nodeUuid }));
    }
  }, [dispatch, nodeUuid]);
  const onPause = useCallback(
    () => dispatch(PositionTrackingActions.pauseTracking()),
    [dispatch],
  );
  const onStop = useCallback(async () => {
    await dispatch(PositionTrackingActions.stopTracking());
  }, [dispatch]);

  const summaryText = trackActive ? (
    <Text
      textKey="dataEntry:positionTracking.trackSummary"
      textParams={{
        length: summary.lengthText,
        pointsCount: summary.pointsCount,
        duration: summary.durationText,
      }}
    />
  ) : (
    hasPoints && (
      <Text
        textKey="dataEntry:positionTracking.trackSummary"
        textParams={{
          length: PositionTracks.formatLength(
            PositionTracks.computeLength(segments),
          ),
          pointsCount: PositionTracks.countPoints(segments),
          duration: PositionTracks.formatDuration(
            PositionTracks.computeDuration(segments),
          ),
        }}
      />
    )
  );

  return (
    <VView style={hasPoints || trackActive ? styles.container : undefined}>
      {(hasPoints || trackActive) && (
        <TrackMapView
          fitOnlyOnce={trackActive}
          segments={segments}
          showsUserLocation={tracking}
        />
      )}
      {summaryText}
      {isTrackedNode && errorKey && <Text textKey={errorKey} />}
      <HView style={styles.previewToolbar}>
        {!!nodeValue && (
          <HView style={styles.previewToolbarLeft}>
            <IconButton icon="download" onPress={onDownloadGeoJsonPress} />
          </HView>
        )}
        <HView style={[styles.previewToolbarCenter, styles.trackButtons]}>
          {tracking ? (
            <Button
              icon="pause"
              onPress={onPause}
              textKey="dataEntry:positionTracking.pause"
            />
          ) : (
            <Button
              disabled={
                !canEditRecord ||
                (isTrackedNode && status === PositionTrackingStatus.starting)
              }
              icon="play"
              onPress={onStart}
              textKey={
                trackActive
                  ? "dataEntry:positionTracking.resume"
                  : "dataEntry:positionTracking.start"
              }
            />
          )}
          {trackActive && (
            <Button
              icon="stop"
              color="secondary"
              onPress={onStop}
              textKey="dataEntry:positionTracking.stop"
            />
          )}
        </HView>
      </HView>
      <Text
        variant="bodySmall"
        textKey="dataEntry:positionTracking.attributeNotEditable"
      />
    </VView>
  );
};
