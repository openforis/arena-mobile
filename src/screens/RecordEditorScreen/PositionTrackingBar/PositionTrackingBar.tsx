import { memo, useCallback, useMemo } from "react";

import { Records } from "@openforis/arena-core";

import { usePositionTrackingSummary } from "hooks/usePositionTracking";
import { PositionTracks } from "model";
import {
  DataEntrySelectors,
  PositionTrackingActions,
  PositionTrackingStatus,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { ActiveTrackingBar } from "./ActiveTrackingBar";
import { IdleTrackingBar } from "./IdleTrackingBar";
import { StoppedTrackingBar } from "./StoppedTrackingBar";

export const PositionTrackingBar = memo(() => {
  const dispatch = useAppDispatch();

  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();

  const summary = usePositionTrackingSummary();
  const { status, nodeUuid, errorKey } = summary;

  const hasTrack =
    status === PositionTrackingStatus.tracking ||
    status === PositionTrackingStatus.paused;
  const starting = status === PositionTrackingStatus.starting;

  // trackable attribute in the root entity (or its single entities): tracking can be started
  // here, also when the record is opened again (a new segment is added to the existing track)
  const startableNode = useMemo(() => {
    if (!survey || !record || hasTrack) return null;
    return PositionTracks.findAutoStartNode({ survey, record });
  }, [hasTrack, record, survey]);

  const nodeUuidToTrack = nodeUuid ?? startableNode?.uuid;
  const hasRecordedTrack = useMemo(() => {
    const node =
      record && nodeUuidToTrack
        ? Records.getNodeByUuid(nodeUuidToTrack)(record)
        : null;
    return PositionTracks.hasTrackPoints(node?.value);
  }, [nodeUuidToTrack, record]);

  const onStart = useCallback(() => {
    if (nodeUuidToTrack) {
      void dispatch(
        PositionTrackingActions.startTracking({ nodeUuid: nodeUuidToTrack }),
      );
    }
  }, [dispatch, nodeUuidToTrack]);

  const onRestart = useCallback(() => {
    if (nodeUuidToTrack) {
      void dispatch(
        PositionTrackingActions.restartTracking({ nodeUuid: nodeUuidToTrack }),
      );
    }
  }, [dispatch, nodeUuidToTrack]);

  if (hasTrack) {
    return <ActiveTrackingBar summary={summary} />;
  }

  if (
    status === PositionTrackingStatus.idle &&
    !errorKey &&
    hasRecordedTrack &&
    nodeUuidToTrack
  ) {
    return (
      <StoppedTrackingBar
        canEdit={canEditRecord}
        nodeUuid={nodeUuidToTrack}
        onRestart={onRestart}
        onResume={onStart}
      />
    );
  }

  const canStart =
    canEditRecord &&
    status === PositionTrackingStatus.idle &&
    (!!startableNode || (!!errorKey && !!nodeUuid));

  if (!starting && !canStart) return null;

  return (
    <IdleTrackingBar
      canStart={canStart}
      errorKey={errorKey}
      hasRecordedTrack={hasRecordedTrack}
      onRestart={onRestart}
      onStart={onStart}
      starting={starting}
    />
  );
});

PositionTrackingBar.displayName = "PositionTrackingBar";
