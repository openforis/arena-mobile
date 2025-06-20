import { CollapsiblePanel, FieldSet, HView, Icon, Text } from "components";
import { RecordLoadStatus, RecordOrigin, RecordSyncStatus } from "model";

import { RecordListConstants } from "./recordListConstants";
import styles from "./styles";
import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";

const LegendItem = ({ icon, iconSource, textKey }) => (
  <HView>
    {icon ? (
      icon
    ) : (
      <>
        <Icon source={iconSource} /> <Text textKey={textKey} />
      </>
    )}
  </HView>
);

const visibleSyncStatus = [
  RecordSyncStatus.new,
  RecordSyncStatus.modifiedLocally,
  RecordSyncStatus.notModified,
  RecordSyncStatus.keysNotSpecified,
  RecordSyncStatus.modifiedRemotely,
  RecordSyncStatus.notInEntryStepAnymore,
];

export const RecordsListLegend = () => {
  return (
    <CollapsiblePanel
      contentStyle={styles.optionsContainer}
      headerKey="common:legend"
    >
      <FieldSet headerKey="recordsList:loadStatus.title">
        {Object.values(RecordLoadStatus).map((loadStatus) => (
          <LegendItem
            iconSource={RecordListConstants.iconByLoadStatus[loadStatus]}
            textKey={`recordsList:loadStatus.${loadStatus}`}
          />
        ))}
      </FieldSet>
      <FieldSet headerKey="recordsList:origin.title">
        {Object.values(RecordOrigin).map((origin) => (
          <LegendItem
            iconSource={RecordListConstants.iconByOrigin[origin]}
            textKey={`recordsList:origin.${origin}`}
          />
        ))}
      </FieldSet>
      <FieldSet headerKey="common:status">
        {visibleSyncStatus.map((syncStatus) => (
          <LegendItem
            icon={
              <RecordSyncStatusIcon alwaysShowLabel item={{ syncStatus }} />
            }
            textKey={`dataEntry:syncStatus.${syncStatus}`}
          />
        ))}
      </FieldSet>
    </CollapsiblePanel>
  );
};
