import { Surveys } from "@openforis/arena-core";

import {
  Button,
  CollapsiblePanel,
  FlexWrapView,
  FormItem,
  HView,
  SegmentedButtons,
  Text,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { Cycles } from "model";
import { SurveySelectors } from "state";

import { SurveyCycleSelector } from "./SurveyCycleSelector";
import { SurveyLanguageSelector } from "./SurveyLanguageSelector";

import styles from "./styles";
import { useCallback } from "react";

type RecordsListOptionsProps = {
  onlyLocal?: boolean;
  onOnlyLocalChange: (value: boolean) => void;
  syncStatusLoading?: boolean;
  onRemoteSyncPress: () => void;
  onImportRecordsFromFilePress: () => void;
};

enum RecordsType {
  local = "local",
  all = "all",
}

const recordTypeButtons = Object.values(RecordsType).map((recordType) => ({
  value: recordType,
  label: `recordsList:recordType.${recordType}`,
}));

export const RecordsListOptions = (props: RecordsListOptionsProps) => {
  const {
    onlyLocal,
    onOnlyLocalChange,
    syncStatusLoading,
    onRemoteSyncPress,
    onImportRecordsFromFilePress,
  } = props;

  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey()!;

  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const defaultCycleText = Cycles.labelFunction(defaultCycleKey);
  const cycles = Surveys.getCycleKeys(survey);

  const recordsType = onlyLocal ? RecordsType.local : RecordsType.all;

  const onRecordsTypeChange = useCallback(
    (value: string) => {
      onOnlyLocalChange(value === RecordsType.local);
    },
    [onOnlyLocalChange],
  );

  return (
    <CollapsiblePanel
      contentStyle={styles.optionsContainer}
      headerKey="dataEntry:options"
    >
      <SurveyLanguageSelector />
      {cycles.length > 1 && (
        <HView style={styles.formItem}>
          <Text
            style={styles.formItemLabel}
            textKey="dataEntry:cycleForNewRecords"
          />
          <Text textKey={defaultCycleText} />
        </HView>
      )}
      <FlexWrapView style={styles.buttonsContainer}>
        {cycles.length > 1 && (
          <SurveyCycleSelector style={styles.cyclesSelector} />
        )}

        <SegmentedButtons
          buttons={recordTypeButtons}
          onChange={onRecordsTypeChange}
          value={recordsType}
        />
        <Button
          color="secondary"
          disabled={!networkAvailable}
          icon="cloud-refresh"
          loading={syncStatusLoading}
          onPress={onRemoteSyncPress}
          textKey="dataEntry:checkStatus"
        />
        <Button
          color="secondary"
          icon="file-import-outline"
          onPress={onImportRecordsFromFilePress}
          textKey="recordsList:importRecordsFromFile.title"
        />
      </FlexWrapView>
    </CollapsiblePanel>
  );
};
