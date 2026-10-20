import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { Button, Modal, Text } from "components";
import {
  usePositionTrackingLiveSegments,
  usePositionTrackingSummary,
} from "hooks/usePositionTracking";
import { PositionTracks } from "model";
import { PositionTrackingStatus, SurveySelectors } from "state";

import { TrackMapView } from "../NodeValuePreview/TrackMapView";

const styles = StyleSheet.create({
  // fills the dialog height
  map: { flex: 1, minHeight: 0 },
  closeButton: { alignSelf: "center" },
});

// track on a map using all the available height
export const TrackDialog = ({
  node,
  nodeDef,
  onDismiss,
}: {
  node: { uuid: string; value?: any };
  nodeDef: any;
  onDismiss: () => void;
}) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const summary = usePositionTrackingSummary();
  const trackActive =
    summary.nodeUuid === node.uuid &&
    (summary.status === PositionTrackingStatus.tracking ||
      summary.status === PositionTrackingStatus.paused);

  const liveSegments = usePositionTrackingLiveSegments();
  const valueSegments = useMemo(
    () => PositionTracks.fromFeature(node.value),
    [node.value],
  );
  const segments = trackActive ? liveSegments : valueSegments;

  return (
    <Modal onDismiss={onDismiss}>
      <Text variant="titleMedium">
        {NodeDefs.getLabelOrName(nodeDef, lang)}
      </Text>
      <TrackMapView
        fitOnlyOnce={trackActive}
        followUserLocation={trackActive && summary.tracking}
        segments={segments}
        showsUserLocation={trackActive && summary.tracking}
        style={styles.map}
      />
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
      <Button
        onPress={onDismiss}
        style={styles.closeButton}
        textKey="common:close"
      />
    </Modal>
  );
};
