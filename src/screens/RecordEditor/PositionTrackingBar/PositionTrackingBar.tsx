import { useCallback, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

import { NodeDefs, Records, Surveys } from "@openforis/arena-core";

import { Button, HView, Icon, LoadingIcon, Text, VView } from "components";
import { usePositionTrackingSummary } from "hooks/usePositionTracking";
import { useTranslation } from "localization";
import { PositionTracks } from "model";
import {
  DataEntrySelectors,
  PositionTrackingActions,
  PositionTrackingStatus,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { NodeEditDialog } from "../NodeComponentSwitch/nodeTypes/NodeEditDialog";
import styles from "./styles";

const statusIcons: Record<PositionTrackingStatus, string> = {
  [PositionTrackingStatus.idle]: "map-marker-path",
  [PositionTrackingStatus.starting]: "map-marker-path",
  [PositionTrackingStatus.tracking]: "record-circle-outline",
  [PositionTrackingStatus.paused]: "pause-circle-outline",
};

type Summary = ReturnType<typeof usePositionTrackingSummary>;

const useContainerStyle = (errorKey: string | null) => {
  const theme = useTheme();
  return useMemo(
    () => [
      styles.container,
      {
        backgroundColor: errorKey
          ? theme.colors.errorContainer
          : theme.colors.secondaryContainer,
      },
    ],
    [errorKey, theme.colors.errorContainer, theme.colors.secondaryContainer],
  );
};

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
const IdleTrackingBar = ({
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
  const theme = useTheme();
  const containerStyle = useContainerStyle(errorKey);

  return (
    <HView style={[containerStyle, styles.header]}>
      {starting ? (
        <LoadingIcon />
      ) : (
        <Icon
          source={errorKey ? "alert-circle-outline" : statusIcons.idle}
          color={errorKey ? theme.colors.error : undefined}
        />
      )}
      <Text
        style={styles.headerText}
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

const buildHeaderText = ({
  summary,
  t,
}: {
  summary: Summary;
  t: (key: string, params?: any) => string;
}) => {
  const {
    status,
    waitingForFix,
    lengthText,
    durationText,
    tracking,
    accuracyText,
  } = summary;
  const parts = [
    t(
      waitingForFix
        ? "dataEntry:positionTracking.waitingForFix"
        : `dataEntry:positionTracking.status.${status}`,
    ),
    lengthText,
    durationText,
  ];
  if (tracking && accuracyText !== null) {
    parts.push(
      t("dataEntry:positionTracking.accuracy", { accuracy: accuracyText }),
    );
  }
  return parts.join(" · ");
};

// track being recorded or paused: summary, expandable to show the tracking buttons
const ActiveTrackingBar = ({ summary }: { summary: Summary }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const record = DataEntrySelectors.useRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();

  const { status, nodeUuid, errorKey, tracking, waitingForFix, pointsCount } =
    summary;

  const [expanded, setExpanded] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);

  const trackedNode = useMemo(
    () => (record && nodeUuid ? Records.getNodeByUuid(nodeUuid)(record) : null),
    [nodeUuid, record],
  );
  const trackedNodeDef = useMemo(
    () =>
      survey && trackedNode
        ? Surveys.getNodeDefByUuid({ survey, uuid: trackedNode.nodeDefUuid })
        : null,
    [survey, trackedNode],
  );

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
  const toggleExpanded = useCallback(
    () => setExpanded((expandedPrev) => !expandedPrev),
    [],
  );
  const openTrackDialog = useCallback(() => setTrackDialogOpen(true), []);
  const closeTrackDialog = useCallback(() => setTrackDialogOpen(false), []);

  const containerStyle = useContainerStyle(errorKey);

  return (
    <VView style={containerStyle}>
      <TouchableOpacity onPress={toggleExpanded}>
        <HView style={styles.header}>
          <Icon
            source={waitingForFix ? "crosshairs-question" : statusIcons[status]}
            color={tracking ? theme.colors.error : undefined}
          />
          <Text style={styles.headerText} variant="labelLarge">
            {buildHeaderText({ summary, t })}
          </Text>
          <Icon source={expanded ? "chevron-up" : "chevron-down"} size={24} />
        </HView>
      </TouchableOpacity>
      {expanded && (
        <VView style={styles.details}>
          {trackedNodeDef && (
            <Text variant="bodyMedium">
              {NodeDefs.getLabelOrName(trackedNodeDef, lang)}
            </Text>
          )}
          <Text
            variant="bodySmall"
            textKey="dataEntry:positionTracking.pointsCount"
            textParams={{ count: pointsCount }}
          />
          {errorKey && <Text variant="bodySmall" textKey={errorKey} />}
          <HView style={styles.buttons}>
            {tracking ? (
              <Button
                compact
                icon="pause"
                color="secondary"
                onPress={onPause}
                textKey="dataEntry:positionTracking.pause"
              />
            ) : (
              <Button
                compact
                disabled={!canEditRecord}
                icon="play"
                color="secondary"
                onPress={onResume}
                textKey="dataEntry:positionTracking.resume"
              />
            )}
            <Button
              compact
              icon="stop"
              color="secondary"
              onPress={onStop}
              textKey="dataEntry:positionTracking.stop"
            />
            {trackedNodeDef && (
              <Button
                compact
                icon="map-search-outline"
                color="secondary"
                onPress={openTrackDialog}
                textKey="dataEntry:positionTracking.showTrack"
              />
            )}
          </HView>
        </VView>
      )}
      {trackDialogOpen && trackedNodeDef && trackedNode && (
        <NodeEditDialog
          nodeDef={trackedNodeDef}
          parentNodeUuid={trackedNode.parentUuid}
          onDismiss={closeTrackDialog}
        />
      )}
    </VView>
  );
};

export const PositionTrackingBar = () => {
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
};
