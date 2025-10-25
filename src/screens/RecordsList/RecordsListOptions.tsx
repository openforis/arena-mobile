import { Surveys } from "@openforis/arena-core";

import {
  Button,
  CollapsiblePanel,
  FlexWrapView,
  FormItem,
  HView,
  Switch,
  Text,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { Cycles } from "model";
import { SurveySelectors } from "state";

import { SurveyCycleSelector } from "./SurveyCycleSelector";
import { SurveyLanguageSelector } from "./SurveyLanguageSelector";

import styles from "./styles";

type RecordsListOptionsProps = {
  onlyLocal?: boolean;
  onOnlyLocalChange: (value: boolean) => void;
  syncStatusLoading?: boolean;
  onRemoteSyncPress: () => void;
  onImportRecordsFromFilePress: () => void;
};

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
      <FlexWrapView>
        {cycles.length > 1 && (
          <SurveyCycleSelector style={styles.cyclesSelector} />
        )}
        <FormItem
          labelKey="dataEntry:showOnlyLocalRecords"
          style={styles.formItem}
        >
          <Switch value={onlyLocal} onChange={onOnlyLocalChange} />
        </FormItem>
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
