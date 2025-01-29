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

      {viewMode === RecordEditViewMode.oneNode ? (
        <PageNodesList />
      ) : (
        <PagesNavigationTree />
      )}

      <GpsLockingEnabledWarning />

      <HView style={styles.buttonBar} transparent>
        <NavigateToRecordsListButton />
        {fieldManualUrl && (
          <IconButton
            icon="help"
            mode="outlined"
            onPress={() => WebBrowser.openBrowserAsync(fieldManualUrl)}
          />
        )}
        <IconButton
          icon="cog"
          onPress={() => navigation.navigate(screenKeys.settings)}
        />
      </HView>
    </View>
  );
};
