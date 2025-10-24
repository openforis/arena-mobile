import PropTypes from "prop-types";

import { CollapsiblePanel, FieldSet, HView, Icon, Text } from "components";
import { RecordLoadStatus, RecordOrigin, RecordSyncStatus } from "model";

import { RecordListConstants } from "./recordListConstants";
import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";

import styles from "./styles";

const LegendItem = ({ icon, iconSource, textKey }: any) => (
  <HView>
    {icon ?? (
      <>
        <Icon source={iconSource} />
        <Text textKey={textKey} />
      </>
    )}
  </HView>
);

LegendItem.propTypes = {
  icon: PropTypes.element,
  iconSource: PropTypes.string,
  textKey: PropTypes.string.isRequired,
};

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
        {Object.values(RecordLoadStatus).map((loadStatus: any) => (
          <LegendItem
            key={loadStatus}
            iconSource={RecordListConstants.iconByLoadStatus[loadStatus]}
            textKey={`recordsList:loadStatus.${loadStatus}`}
          />
        ))}
      </FieldSet>
      <FieldSet headerKey="recordsList:origin.title">
        {Object.values(RecordOrigin).map((origin: any) => (
          <LegendItem
            key={origin}
            iconSource={RecordListConstants.iconByOrigin[origin]}
            textKey={`recordsList:origin.${origin}`}
          />
        ))}
      </FieldSet>
      <FieldSet headerKey="common:status">
        {visibleSyncStatus.map((syncStatus: any) => (
          <LegendItem
            key={syncStatus}
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
