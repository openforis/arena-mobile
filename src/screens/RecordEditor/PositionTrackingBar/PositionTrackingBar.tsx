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

export const PositionTrackingBar = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const record = DataEntrySelectors.useRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();

  const summary = usePositionTrackingSummary();
  const {
    status,
    nodeUuid,
    errorKey,
    tracking,
    waitingForFix,
    lengthText,
    durationText,
    accuracyText,
    pointsCount,
  } = summary;

  const [expanded, setExpanded] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);

  const hasTrack =
    status === PositionTrackingStatus.tracking ||
    status === PositionTrackingStatus.paused;

  // trackable attribute in the root entity (or its single entities): tracking can be started
  // here, also when the record is opened again (a new segment is added to the existing track)
  const startableNode = useMemo(() => {
    if (!survey || !record || hasTrack) return null;
    return PositionTracks.findAutoStartNode({ survey, record });
  }, [hasTrack, record, survey]);

  const trackedNode = useMemo(
    () =>
      record && nodeUuid ? Records.getNodeByUuid(nodeUuid)(record) : null,
    [nodeUuid, record],
  );
  const trackedNodeDef = useMemo(
    () =>
      survey && trackedNode
        ? Surveys.getNodeDefByUuid({ survey, uuid: trackedNode.nodeDefUuid })
        : null,
    [survey, trackedNode],
  );

  const onStart = useCallback(() => {
    const nodeUuidToTrack = nodeUuid ?? startableNode?.uuid;
    if (nodeUuidToTrack) {
      void dispatch(
        PositionTrackingActions.startTracking({ nodeUuid: nodeUuidToTrack }),
      );
    }
  }, [dispatch, nodeUuid, startableNode]);

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

  const containerStyle = useMemo(
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

  const canStart =
    canEditRecord &&
    status === PositionTrackingStatus.idle &&
    (!!startableNode || (!!errorKey && !!nodeUuid));

  if (!hasTrack && status !== PositionTrackingStatus.starting && !canStart) {
    return null;
  }

  if (!hasTrack) {
    return (
      <HView style={[containerStyle, styles.header]}>
        {status === PositionTrackingStatus.starting ? (
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
          textKey={
            errorKey ??
            (status === PositionTrackingStatus.starting
              ? "dataEntry:positionTracking.status.starting"
              : "dataEntry:positionTracking.title")
          }
        />
        {canStart && (
          <Button
            compact
            icon="play"
            mode="text"
            onPress={onStart}
            textKey={
              errorKey
                ? "dataEntry:positionTracking.retry"
                : "dataEntry:positionTracking.start"
            }
          />
        )}
      </HView>
    );
  }

  const headerTextParts = [
    t(
      waitingForFix
        ? "dataEntry:positionTracking.waitingForFix"
        : `dataEntry:positionTracking.status.${status}`,
    ),
    lengthText,
    durationText,
  ];
  if (tracking && accuracyText !== null) {
    headerTextParts.push(
      t("dataEntry:positionTracking.accuracy", { accuracy: accuracyText }),
    );
  }

  return (
    <VView style={containerStyle}>
      <TouchableOpacity onPress={toggleExpanded}>
        <HView style={styles.header}>
          <Icon
            source={
              waitingForFix ? "crosshairs-question" : statusIcons[status]
            }
            color={tracking ? theme.colors.error : undefined}
          />
          <Text style={styles.headerText} variant="labelLarge">
            {headerTextParts.join(" · ")}
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
                mode="outlined"
                onPress={onPause}
                textKey="dataEntry:positionTracking.pause"
              />
            ) : (
              <Button
                compact
                disabled={!canEditRecord}
                icon="play"
                mode="outlined"
                onPress={onResume}
                textKey="dataEntry:positionTracking.resume"
              />
            )}
            <Button
              compact
              icon="stop"
              mode="outlined"
              onPress={onStop}
              textKey="dataEntry:positionTracking.stop"
            />
            {trackedNodeDef && (
              <Button
                compact
                icon="map-search-outline"
                mode="outlined"
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
