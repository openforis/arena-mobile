import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

import { Surveys } from "@openforis/arena-core";

import { CloseIconButton, HView, IconButton, Text, View } from "components";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { NavigateToRecordsListButton } from "appComponents/NavigateToRecordsListButton";
import { RecordEditViewMode } from "model";
import { screenKeys } from "screens/screenKeys";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
} from "state";

import { PagesNavigationTree } from "../PagesNavigationTree";
import { PageNodesList } from "../PageNodesList";

import { useStyles } from "./styles";

export const RecordEditorDrawer = () => {
  if (__DEV__) {
    console.log(`rendering RecordEditorDrawer`);
  }
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const pageSelectorOpen = DataEntrySelectors.useIsRecordPageSelectorMenuOpen();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const styles = useStyles();
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);

  if (!pageSelectorOpen) return null;

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'View' as a type.
    <View style={styles.container}>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <HView style={styles.titleContainer}>
        <Text
          // @ts-expect-error TS(2304): Cannot find name 'numberOfLines'.
          numberOfLines={1}
          // @ts-expect-error TS(2304): Cannot find name 'variant'.
          variant="titleLarge"
          // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
          style={styles.titleText}
          // @ts-expect-error TS(2304): Cannot find name 'textKey'.
          textKey={Surveys.getLabel(lang)(survey) ?? Surveys.getName(survey)}
        />
        // @ts-expect-error TS(2709): Cannot use namespace 'CloseIconButton' as a type.
        <CloseIconButton
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={() => dispatch(DataEntryActions.toggleRecordPageMenuOpen)}
          // @ts-expect-error TS(2304): Cannot find name 'style'.
          style={styles.closeButton}
          // @ts-expect-error TS(2304): Cannot find name 'size'.
          size={26}
        />
      </HView>

      {viewMode === RecordEditViewMode.oneNode ? (
        // @ts-expect-error TS(2749): 'PageNodesList' refers to a value, but is being us... Remove this comment to see the full error message
        <PageNodesList />
      ) : (
        // @ts-expect-error TS(2749): 'PagesNavigationTree' refers to a value, but is be... Remove this comment to see the full error message
        <PagesNavigationTree />
      )}

      // @ts-expect-error TS(2749): 'GpsLockingEnabledWarning' refers to a value, but ... Remove this comment to see the full error message
      <GpsLockingEnabledWarning />

      // @ts-expect-error TS(2304): Cannot find name 'style'.
      <HView style={styles.buttonBar} transparent>
        // @ts-expect-error TS(2749): 'NavigateToRecordsListButton' refers to a value, b... Remove this comment to see the full error message
        <NavigateToRecordsListButton />
        {fieldManualUrl && (
          // @ts-expect-error TS(2709): Cannot use namespace 'IconButton' as a type.
          <IconButton
            // @ts-expect-error TS(2304): Cannot find name 'icon'.
            icon="help"
            // @ts-expect-error TS(2304): Cannot find name 'mode'.
            mode="outlined"
            // @ts-expect-error TS(2304): Cannot find name 'onPress'.
            onPress={() => WebBrowser.openBrowserAsync(fieldManualUrl)}
          />
        )}
        // @ts-expect-error TS(2709): Cannot use namespace 'IconButton' as a type.
        <IconButton
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="cog"
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={() => navigation.navigate(screenKeys.settings)}
        // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
        />
      </HView>
    </View>
  );
};
