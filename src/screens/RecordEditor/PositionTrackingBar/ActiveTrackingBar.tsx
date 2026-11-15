import { Text, VView } from "components";
import { useTranslation } from "localization";
import { useAppTheme } from "theme";

import { ExpandableHeader } from "./ExpandableHeader";
import { ActiveTrackingButtons } from "./TrackButtons";
import {
  BarTone,
  statusIcons,
  Summary,
  useBarColors,
  useExpanded,
} from "./trackingBarUtils";
import { TrackNodeLabel } from "./TrackNodeLabel";

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
export const ActiveTrackingBar = ({ summary }: { summary: Summary }) => {
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
