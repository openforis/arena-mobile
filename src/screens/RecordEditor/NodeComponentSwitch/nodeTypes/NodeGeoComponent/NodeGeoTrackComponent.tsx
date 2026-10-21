import { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";

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
import { TrackDialog } from "../../../PositionTrackingBar/TrackDialog";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useNodeGeoComponent } from "./useNodeGeoComponent";
import styles from "./styles";

// geo attribute with position tracking enabled: the value is read-only, written only by tracking
export const NodeGeoTrackComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid } = props;

  const dispatch = useAppDispatch();
  const theme = useTheme();
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
  // deleting a recorded track ("Restart" or "Delete") requires a strong confirm
  const hasRecordedTrack = PositionTracks.hasTrackPoints(nodeValue);

  const onStart = useCallback(() => {
    if (nodeUuid) {
      void dispatch(PositionTrackingActions.startTracking({ nodeUuid }));
    }
  }, [dispatch, nodeUuid]);
  const onRestart = useCallback(() => {
    if (nodeUuid) {
      void dispatch(PositionTrackingActions.restartTracking({ nodeUuid }));
    }
  }, [dispatch, nodeUuid]);
  const onDelete = useCallback(() => {
    if (nodeUuid) {
      void dispatch(PositionTrackingActions.deleteTrack({ nodeUuid }));
    }
  }, [dispatch, nodeUuid]);
  const onPause = useCallback(
    () => dispatch(PositionTrackingActions.pauseTracking()),
    [dispatch],
  );
  const onStop = useCallback(async () => {
    await dispatch(PositionTrackingActions.stopTracking());
  }, [dispatch]);

  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const openMapDialog = useCallback(() => setMapDialogOpen(true), []);
  const closeMapDialog = useCallback(() => setMapDialogOpen(false), []);
  const showMap = hasPoints || trackActive;

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
    <VView style={showMap ? styles.container : undefined}>
      {showMap && (
        <TrackMapView
          fitOnlyOnce={trackActive}
          interactive={false}
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
            {canEditRecord && !trackActive && hasRecordedTrack && (
              <IconButton icon="delete" onPress={onDelete} />
            )}
          </HView>
        )}
        {canEditRecord && (
          <HView style={[styles.previewToolbarCenter, styles.trackButtons]}>
            {tracking ? (
              <IconButton icon="pause" onPress={onPause} />
            ) : (
              <Button
                disabled={
                  isTrackedNode && status === PositionTrackingStatus.starting
                }
                icon="play"
                onPress={onStart}
                textKey={
                  trackActive || hasRecordedTrack
                    ? "dataEntry:positionTracking.resume"
                    : "dataEntry:positionTracking.start"
                }
              />
            )}
            {!trackActive && hasRecordedTrack && (
              <Button
                color="secondary"
                icon="restart"
                onPress={onRestart}
                textKey="dataEntry:positionTracking.restart"
              />
            )}
            {trackActive && (
              <IconButton
                icon="stop"
                iconColor={theme.colors.error}
                onPress={onStop}
              />
            )}
          </HView>
        )}
        {showMap && (
          <HView style={styles.previewToolbarRight}>
            <IconButton icon="fullscreen" onPress={openMapDialog} />
          </HView>
        )}
      </HView>
      {mapDialogOpen && nodeUuid && (
        <TrackDialog
          node={{ uuid: nodeUuid, value: nodeValue }}
          nodeDef={nodeDef}
          onDismiss={closeMapDialog}
        />
      )}
      <Text
        variant="bodySmall"
        textKey="dataEntry:positionTracking.attributeNotEditable"
      />
    </VView>
  );
};
