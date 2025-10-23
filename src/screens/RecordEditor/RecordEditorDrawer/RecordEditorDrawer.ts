import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { CloseIconButton, HView, IconButton, Text, View } from "components";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/GpsLockingEnable... Remove this comment to see the full error message
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/NavigateToRecord... Remove this comment to see the full error message
import { NavigateToRecordsListButton } from "appComponents/NavigateToRecordsListButton";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordEditViewMode } from "model";
// @ts-expect-error TS(2307): Cannot find module 'screens/screenKeys' or its cor... Remove this comment to see the full error message
import { screenKeys } from "screens/screenKeys";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
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

      <GpsLockingEnabledWarning />

      // @ts-expect-error TS(2304): Cannot find name 'style'.
      <HView style={styles.buttonBar} transparent>
        <NavigateToRecordsListButton />
        {fieldManualUrl && (
          <IconButton
            // @ts-expect-error TS(2304): Cannot find name 'icon'.
            icon="help"
            // @ts-expect-error TS(2304): Cannot find name 'mode'.
            mode="outlined"
            // @ts-expect-error TS(2304): Cannot find name 'onPress'.
            onPress={() => WebBrowser.openBrowserAsync(fieldManualUrl)}
          />
        )}
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
