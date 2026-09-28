import { Surveys } from "@openforis/arena-core";

import {
  Button,
  CollapsiblePanel,
  FlexWrapView,
  HView,
  Text,
} from "components";
import { Cycles } from "model";
import { SurveySelectors } from "state";

import { SurveyCycleSelector } from "./SurveyCycleSelector";
import { SurveyLanguageSelector } from "./SurveyLanguageSelector";

import styles from "./styles";

type RecordsListOptionsProps = {
  onImportRecordsFromFilePress: () => void;
  onRevalidateAllRecordsPress: () => void;
};

// less frequently used settings/actions, collapsed by default; the records type selector,
// "Check status" and auto-sync are always visible instead - see RecordsListToolbar
export const RecordsListOptions = (props: RecordsListOptionsProps) => {
  const { onImportRecordsFromFilePress, onRevalidateAllRecordsPress } = props;

  const survey = SurveySelectors.useCurrentSurvey()!;

  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const defaultCycleText = Cycles.labelFunction(defaultCycleKey);
  const cycles = Surveys.getCycleKeys(survey);

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
