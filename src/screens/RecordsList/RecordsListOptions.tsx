import { useCallback } from "react";

import { Surveys } from "@openforis/arena-core";

import {
  Button,
  CollapsiblePanel,
  FlexWrapView,
  HView,
  SegmentedButtons,
  Text,
} from "components";
import { Cycles } from "model";
import { SurveySelectors } from "state";

import { SurveyCycleSelector } from "./SurveyCycleSelector";
import { SurveyLanguageSelector } from "./SurveyLanguageSelector";

import styles from "./styles";

enum RecordsType {
  local = "local",
  all = "all",
}

const recordTypeButtons = Object.values(RecordsType).map((recordType) => ({
  value: recordType,
  label: `recordsList:recordType.${recordType}`,
}));

type RecordsListOptionsProps = {
  onImportRecordsFromFilePress: () => void;
  onlyLocal?: boolean;
  onOnlyLocalChange: (value: boolean) => void;
  onRevalidateAllRecordsPress: () => void;
};

// less frequently used settings/actions, collapsed by default; "Check status" and auto-sync
// are always visible instead - see RecordsListDock
export const RecordsListOptions = (props: RecordsListOptionsProps) => {
  const {
    onImportRecordsFromFilePress,
    onlyLocal,
    onOnlyLocalChange,
    onRevalidateAllRecordsPress,
  } = props;

  const recordsType = onlyLocal ? RecordsType.local : RecordsType.all;

  const onRecordsTypeChange = useCallback(
    (value: string) => {
      onOnlyLocalChange(value === RecordsType.local);
    },
    [onOnlyLocalChange],
  );

  const survey = SurveySelectors.useCurrentSurvey()!;

  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const defaultCycleText = Cycles.labelFunction(defaultCycleKey);
  const cycles = Surveys.getCycleKeys(survey);

  return (
    <CollapsiblePanel
      contentStyle={styles.optionsContainer}
      headerKey="dataEntry:options"
    >
      <SegmentedButtons
        buttons={recordTypeButtons}
        onChange={onRecordsTypeChange}
        value={recordsType}
      />
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
        <Button
          color="secondary"
          icon="file-import-outline"
          onPress={onImportRecordsFromFilePress}
          textKey="recordsList:importRecordsFromFile.title"
        />
        <Button
          color="secondary"
          icon="clipboard-check-outline"
          onPress={onRevalidateAllRecordsPress}
          textKey="recordsList:revalidateRecords.allRecordsTitle"
        />
      </FlexWrapView>
    </CollapsiblePanel>
  );
};
