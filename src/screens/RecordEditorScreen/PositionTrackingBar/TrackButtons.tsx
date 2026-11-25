import { useCallback, useMemo, useState } from "react";

import { Records, Surveys } from "@openforis/arena-core";

import { Button, HView, IconButton } from "components";
import { usePositionTrackingSummary } from "hooks/usePositionTracking";
import {
  DataEntrySelectors,
  PositionTrackingActions,
  PositionTrackingStatus,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { useAppTheme } from "theme";

import styles from "./styles";
import { TrackDialog } from "./TrackDialog";

export const useTrackNode = (nodeUuid: string | null | undefined) => {
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  return useMemo(() => {
    const node =
      record && nodeUuid ? Records.getNodeByUuid(nodeUuid)(record) : null;
    const nodeDef =
      survey && node
        ? Surveys.getNodeDefByUuid({ survey, uuid: node.nodeDefUuid })
        : null;
    return { node, nodeDef };
  }, [nodeUuid, record, survey]);
};

// shows the track on a map in a dialog
export const ShowTrackButton = ({ nodeUuid }: { nodeUuid: string }) => {
  const { node, nodeDef } = useTrackNode(nodeUuid);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  if (!node || !nodeDef) return null;

  return (
    <>
      <Button
        compact
        icon="map-search-outline"
        color="secondary"
        onPress={openDialog}
        textKey="dataEntry:positionTracking.showTrack"
      />
      {dialogOpen && (
        <TrackDialog node={node} nodeDef={nodeDef} onDismiss={closeDialog} />
      )}
    </>
  );
};

// buttons of a track being recorded or paused: Pause/Resume, Show track, Stop
export const ActiveTrackingButtons = ({ nodeUuid }: { nodeUuid: string }) => {
  const dispatch = useAppDispatch();
  const theme = useAppTheme();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();
  const { status } = usePositionTrackingSummary();
  const tracking = status === PositionTrackingStatus.tracking;

  const onPause = useCallback(
    () => dispatch(PositionTrackingActions.pauseTracking()),
    [dispatch],
  );
  const onResume = useCallback(
    () => dispatch(PositionTrackingActions.resumeTracking()),
    [dispatch],
  );
  const onStop = useCallback(async () => {
    await dispatch(PositionTrackingActions.stopTracking());
  }, [dispatch]);

  return (
    <HView style={styles.buttons}>
      {/* record edit locked (or not editable): the track can only be viewed */}
      {canEditRecord && tracking && (
        <IconButton icon="pause" onPress={onPause} size={32} />
      )}
      {canEditRecord && !tracking && (
        <IconButton icon="play" onPress={onResume} size={32} />
      )}
      <ShowTrackButton nodeUuid={nodeUuid} />
      {canEditRecord && (
        <IconButton
          icon="stop"
          iconColor={theme.colors.error}
          onPress={onStop}
          size={32}
          style={styles.stopButton}
        />
      )}
    </HView>
  );
};
