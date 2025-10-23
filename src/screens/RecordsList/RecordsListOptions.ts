// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

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

export const RecordsListOptions = (props: any) => {
  const {
    onlyLocal,
    onOnlyLocalChange,
    syncStatusLoading,
    onRemoteSyncPress,
    onImportRecordsFromFilePress,
  } = props;

  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey();

  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const defaultCycleText = Cycles.labelFunction(defaultCycleKey);
  const cycles = Surveys.getCycleKeys(survey);

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'CollapsiblePanel' as a type.
    <CollapsiblePanel
      // @ts-expect-error TS(2304): Cannot find name 'contentStyle'.
      contentStyle={styles.optionsContainer}
      // @ts-expect-error TS(7027): Unreachable code detected.
      headerKey="dataEntry:options"
    >
      // @ts-expect-error TS(2749): 'SurveyLanguageSelector' refers to a value, but is... Remove this comment to see the full error message
      <SurveyLanguageSelector />
      {cycles.length > 1 && (
        // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
        <HView style={styles.formItem}>
          <Text
            // @ts-expect-error TS(2304): Cannot find name 'style'.
            style={styles.formItemLabel}
            // @ts-expect-error TS(2304): Cannot find name 'textKey'.
            textKey="dataEntry:cycleForNewRecords"
          />
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
          <Text textKey={defaultCycleText} />
        </HView>
      )}
      // @ts-expect-error TS(2709): Cannot use namespace 'FlexWrapView' as a type.
      <FlexWrapView>
        // @ts-expect-error TS(2552): Cannot find name 'cycles'. Did you mean 'Cycles'?
        {cycles.length > 1 && (
          // @ts-expect-error TS(2709): Cannot use namespace 'SurveyCycleSelector' as a ty... Remove this comment to see the full error message
          <SurveyCycleSelector style={styles.cyclesSelector} />
        )}
        // @ts-expect-error TS(2709): Cannot use namespace 'FormItem' as a type.
        <FormItem
          // @ts-expect-error TS(2304): Cannot find name 'labelKey'.
          labelKey="dataEntry:showOnlyLocalRecords"
          // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
          style={styles.formItem}
        >
          // @ts-expect-error TS(2709): Cannot use namespace 'Switch' as a type.
          <Switch value={onlyLocal} onChange={onOnlyLocalChange} />
        </FormItem>
        <Button
          // @ts-expect-error TS(2304): Cannot find name 'color'.
          color="secondary"
          // @ts-expect-error TS(2304): Cannot find name 'disabled'.
          disabled={!networkAvailable}
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="cloud-refresh"
          // @ts-expect-error TS(2304): Cannot find name 'loading'.
          loading={syncStatusLoading}
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={onRemoteSyncPress}
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
          textKey="dataEntry:checkStatus"
        />
        // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
        <Button
          // @ts-expect-error TS(2304): Cannot find name 'color'.
          color="secondary"
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="file-import-outline"
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={onImportRecordsFromFilePress}
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
          textKey="recordsList:importRecordsFromFile.title"
        />
      </FlexWrapView>
    </CollapsiblePanel>
  );
};

RecordsListOptions.propTypes = {
  onlyLocal: PropTypes.bool,
  onOnlyLocalChange: PropTypes.func.isRequired,
  syncStatusLoading: PropTypes.bool,
  onRemoteSyncPress: PropTypes.func.isRequired,
  onImportRecordsFromFilePress: PropTypes.func.isRequired,
};
