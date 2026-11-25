import { useMemo } from "react";

import { Button, HView, Text, VView } from "components";
import { useTranslation } from "localization";
import { PositionTracks } from "model";

import { DeleteTrackButton } from "./DeleteTrackButton";
import { ExpandableHeader } from "./ExpandableHeader";
import styles from "./styles";
import { ShowTrackButton, useTrackNode } from "./TrackButtons";
import {
  BarTone,
  statusIcons,
  useBarColors,
  useExpanded,
} from "./trackingBarUtils";
import { TrackNodeLabel } from "./TrackNodeLabel";

// tracking stopped with a recorded track: summary, expandable to resume, restart, show or delete the track
export const StoppedTrackingBar = ({
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
