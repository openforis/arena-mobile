import { useNavigator } from "navigation/navigator";
import * as WebBrowser from "expo-web-browser";

import { Surveys } from "@openforis/arena-core";

import { CloseIconButton, HView, IconButton, Text, View } from "components";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { NavigateToRecordsListButton } from "appComponents/NavigateToRecordsListButton";
import { RecordEditViewMode } from "model";
import { log, PreviewMode } from "utils";
import {
  DataEntryActions,
  DataEntrySelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { PagesNavigationTree } from "../PagesNavigationTree";
import { PageNodesList } from "../PageNodesList";
import { RecordCompletionProgressBar } from "../RecordCompletionProgressBar";

import { useStyles } from "./styles";

export const RecordEditorDrawer = () => {
  log.debug(`rendering RecordEditorDrawer`);
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const pageSelectorOpen = DataEntrySelectors.useIsRecordPageSelectorMenuOpen();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const { showRecordCompletion } = SettingsSelectors.useSettings();
  const styles = useStyles();
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);

  if (!pageSelectorOpen) return null;

  return (
    <View style={styles.container}>
      <HView style={styles.titleContainer}>
        <Text
          numberOfLines={1}
          variant="titleLarge"
          style={styles.titleText}
          textKey={Surveys.getLabel(lang)(survey) ?? Surveys.getName(survey)}
        />
        <CloseIconButton
          onPress={() => dispatch(DataEntryActions.toggleRecordPageMenuOpen)}
          style={styles.closeButton}
          size={26}
        />
      </HView>

      {showRecordCompletion && <RecordCompletionProgressBar compact />}

      {viewMode === RecordEditViewMode.oneNode ? (
        <PageNodesList />
      ) : (
        <PagesNavigationTree />
      )}

      <GpsLockingEnabledWarning />

      <HView style={styles.buttonBar}>
        {
          // no records list and settings in web preview mode
          !PreviewMode.isActive && <NavigateToRecordsListButton />
        }
        {fieldManualUrl && (
          <IconButton
            icon="help"
            mode="outlined"
            onPress={async () => {
              await WebBrowser.openBrowserAsync(fieldManualUrl);
            }}
          />
        )}
        {!PreviewMode.isActive && (
          <IconButton
            icon="cog"
            onPress={() => navigator.navigateToSettings()}
          />
        )}
      </HView>
    </View>
  );
};
