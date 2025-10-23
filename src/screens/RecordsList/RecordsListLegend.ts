// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { CollapsiblePanel, FieldSet, HView, Icon, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordLoadStatus, RecordOrigin, RecordSyncStatus } from "model";

import { RecordListConstants } from "./recordListConstants";
import { RecordSyncStatusIcon } from "./RecordSyncStatusIcon";

import styles from "./styles";

const LegendItem = ({
  icon,
  iconSource,
  textKey
// @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
}: any) => (
  <HView>
    {icon ?? (
      <>
        // @ts-expect-error TS(2304): Cannot find name 'source'.
        <Icon source={iconSource} />
        // @ts-expect-error TS(7031): Binding element 'textKey' implicitly has an 'any' ... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2304): Cannot find name 'contentStyle'.
      contentStyle={styles.optionsContainer}
      // @ts-expect-error TS(7027): Unreachable code detected.
      headerKey="common:legend"
    >
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      <FieldSet headerKey="recordsList:loadStatus.title">
        // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        {Object.values(RecordLoadStatus).map((loadStatus: any) => <LegendItem
          // @ts-expect-error TS(2304): Cannot find name 'key'.
          key={loadStatus}
          // @ts-expect-error TS(2304): Cannot find name 'iconSource'.
          iconSource={RecordListConstants.iconByLoadStatus[loadStatus]}
          // @ts-expect-error TS(2588): Cannot assign to 'textKey' because it is a constan... Remove this comment to see the full error message
          textKey={`recordsList:loadStatus.${loadStatus}`}
        />)}
      </FieldSet>
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      <FieldSet headerKey="recordsList:origin.title">
        // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        {Object.values(RecordOrigin).map((origin: any) => <LegendItem
          // @ts-expect-error TS(2304): Cannot find name 'key'.
          key={origin}
          // @ts-expect-error TS(2304): Cannot find name 'iconSource'.
          iconSource={RecordListConstants.iconByOrigin[origin]}
          // @ts-expect-error TS(2588): Cannot assign to 'textKey' because it is a constan... Remove this comment to see the full error message
          textKey={`recordsList:origin.${origin}`}
        />)}
      </FieldSet>
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      <FieldSet headerKey="common:status">
        // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        {visibleSyncStatus.map((syncStatus: any) => <LegendItem
          // @ts-expect-error TS(2304): Cannot find name 'key'.
          key={syncStatus}
          // @ts-expect-error TS(2552): Cannot find name 'icon'. Did you mean 'Icon'?
          icon={
            // @ts-expect-error TS(2304): Cannot find name 'alwaysShowLabel'.
            <RecordSyncStatusIcon alwaysShowLabel item={{ syncStatus }} />
          }
          // @ts-expect-error TS(2588): Cannot assign to 'textKey' because it is a constan... Remove this comment to see the full error message
          textKey={`dataEntry:syncStatus.${syncStatus}`}
        // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
        />)}
      </FieldSet>
    </CollapsiblePanel>
  );
};
