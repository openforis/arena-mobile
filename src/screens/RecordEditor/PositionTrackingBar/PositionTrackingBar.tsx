import { useCallback, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";

import { NodeDefs, Records } from "@openforis/arena-core";

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
import { AppThemeColors, useAppTheme } from "theme";

import styles from "./styles";
import {
  ActiveTrackingButtons,
  ShowTrackButton,
  useTrackNode,
} from "./TrackButtons";

const statusIcons: Record<PositionTrackingStatus, string> = {
  [PositionTrackingStatus.idle]: "map-marker-path",
  [PositionTrackingStatus.starting]: "map-marker-path",
  [PositionTrackingStatus.tracking]: "record-circle-outline",
  [PositionTrackingStatus.paused]: "pause-circle-outline",
};

type Summary = ReturnType<typeof usePositionTrackingSummary>;

const DeleteTrackButton = ({ nodeUuid }: { nodeUuid: string }) => {
  const dispatch = useAppDispatch();
  const onPress = useCallback(
    () => dispatch(PositionTrackingActions.deleteTrack({ nodeUuid })),
    [dispatch, nodeUuid],
  );
  return (
    <Button
      compact
      icon="delete"
      color="secondary"
      onPress={onPress}
      textKey="dataEntry:positionTracking.delete"
    />
  );
};

const ExpandableHeader = ({
  expanded,
  iconColor,
  iconSource,
  onPress,
  text,
  textColor,
}: {
  expanded: boolean;
  iconColor?: string;
  iconSource: string;
  onPress: () => void;
  text: string;
  textColor: string;
}) => (
  <TouchableOpacity onPress={onPress}>
    <HView style={styles.header}>
      <Icon source={iconSource} color={iconColor ?? textColor} />
      {/* one line, to take as little space as possible above the form */}
      <Text
        numberOfLines={1}
        style={[styles.headerText, { color: textColor }]}
        variant="labelLarge"
      >
        {text}
      </Text>
      <Icon
        source={expanded ? "chevron-up" : "chevron-down"}
        color={textColor}
        size={24}
      />
    </HView>
  </TouchableOpacity>
);

const useExpanded = () => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(
    () => setExpanded((expandedPrev) => !expandedPrev),
    [],
  );
  return { expanded, toggleExpanded };
};

const TrackNodeLabel = ({ nodeUuid }: { nodeUuid: string }) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const { nodeDef } = useTrackNode(nodeUuid);
  if (!nodeDef) return null;
  return (
    <Text variant="bodyMedium">{NodeDefs.getLabelOrName(nodeDef, lang)}</Text>
  );
};

// green only while points are being collected, so the user can tell it at a glance
enum BarTone {
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

const useBarColors = (tone: BarTone) => {
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

const getActiveBarTone = ({
  errorKey,
  tracking,
  waitingForFix,
}: Summary): BarTone => {
  if (errorKey) return BarTone.error;
  return tracking && !waitingForFix
    ? BarTone.collecting
    : BarTone.notCollecting;
};

// track being recorded or paused: summary, expandable to show the tracking buttons
const ActiveTrackingBar = ({ summary }: { summary: Summary }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const { status, nodeUuid, errorKey, tracking, waitingForFix, pointsCount } =
    summary;

  const { expanded, toggleExpanded } = useExpanded();

  const { containerStyle, detailsStyle, textColor } = useBarColors(
    getActiveBarTone(summary),
  );
  const headerText = buildHeaderText({ summary, t });

  return (
    <VView style={containerStyle}>
      <ExpandableHeader
        expanded={expanded}
        // red "recording" dot
        iconColor={tracking && !waitingForFix ? theme.colors.error : undefined}
        iconSource={waitingForFix ? "crosshairs-question" : statusIcons[status]}
        onPress={toggleExpanded}
        text={headerText}
        textColor={textColor}
      />
      {expanded && (
        <VView style={detailsStyle}>
          <Text variant="bodySmall">{headerText}</Text>
          {nodeUuid && <TrackNodeLabel nodeUuid={nodeUuid} />}
          <Text
            variant="bodySmall"
            textKey="dataEntry:positionTracking.pointsCount"
            textParams={{ count: pointsCount }}
          />
          {errorKey && <Text variant="bodySmall" textKey={errorKey} />}
          {nodeUuid && <ActiveTrackingButtons nodeUuid={nodeUuid} />}
        </VView>
      )}
    </VView>
  );
};

// tracking stopped with a recorded track: summary, expandable to resume, restart, show or delete the track
const StoppedTrackingBar = ({
  canEdit,
  nodeUuid,
  onRestart,
  onResume,
}: {
  canEdit: boolean;
  nodeUuid: string;
  onRestart: () => void;
  onResume: () => void;
}) => {
  const { t } = useTranslation();
  const { node } = useTrackNode(nodeUuid);
  const { expanded, toggleExpanded } = useExpanded();
  const { containerStyle, detailsStyle, textColor } = useBarColors(
    BarTone.notCollecting,
  );

  const segments = useMemo(
    () => PositionTracks.fromFeature(node?.value),
    [node?.value],
  );
  const headerText = [
    t("dataEntry:positionTracking.status.stopped"),
    PositionTracks.formatLength(PositionTracks.computeLength(segments)),
    PositionTracks.formatDuration(PositionTracks.computeDuration(segments)),
  ].join(" · ");

  return (
    <VView style={containerStyle}>
      <ExpandableHeader
        expanded={expanded}
        iconSource={statusIcons.idle}
        onPress={toggleExpanded}
        text={headerText}
        textColor={textColor}
      />
      {expanded && (
        <VView style={detailsStyle}>
          <Text variant="bodySmall">{headerText}</Text>
          <TrackNodeLabel nodeUuid={nodeUuid} />
          <Text
            variant="bodySmall"
            textKey="dataEntry:positionTracking.pointsCount"
            textParams={{ count: PositionTracks.countPoints(segments) }}
          />
          <HView style={styles.buttons}>
            {canEdit && (
              <Button
                compact
                icon="play"
                color="secondary"
                onPress={onResume}
                textKey="dataEntry:positionTracking.resume"
              />
            )}
            {canEdit && (
              <Button
                compact
                icon="restart"
                color="secondary"
                onPress={onRestart}
                textKey="dataEntry:positionTracking.restart"
              />
            )}
            <ShowTrackButton nodeUuid={nodeUuid} />
            {canEdit && <DeleteTrackButton nodeUuid={nodeUuid} />}
          </HView>
        </VView>
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
};
