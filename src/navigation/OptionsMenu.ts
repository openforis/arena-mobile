import { useDispatch } from "react-redux";
import { Appbar as RNPAppbar, Divider, Menu } from "react-native-paper";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

import { MenuItem } from "components";
import { useScreenKey } from "hooks";
import { screenKeys } from "screens";
import {
  ConfirmActions,
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
} from "state";
import { Environment } from "utils";

import { UserSummary } from "./UserSummary";

export const OptionsMenu = (props) => {
  const { toggleMenu, visible } = props;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const screenKey = useScreenKey();
  const editingRecord =
    DataEntrySelectors.useIsEditingRecord() &&
    screenKey === screenKeys.recordEditor;
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const fieldManualUrl = survey
    ? Surveys.getFieldManualLink(lang)(survey)
    : null;

  return (
    <Menu
      anchor={<RNPAppbar.Action icon="dots-vertical" onPress={toggleMenu} />}
      onDismiss={toggleMenu}
      visible={visible}
    >
      <UserSummary
        navigation={navigation}
        onButtonPress={() => toggleMenu()}
        profileIconSize={40}
        showLogoutButton={false}
      />

      <Divider />

      {!editingRecord && (
        <MenuItem
          icon="view-list"
          onPress={() => {
            navigation.navigate(screenKeys.surveysListLocal);
          }}
          title="surveys:title"
          toggleMenu={toggleMenu}
        />
      )}
      {editingRecord && (
        <>
          <MenuItem
            icon="view-list"
            onPress={() => {
              dispatch(DataEntryActions.navigateToRecordsList({ navigation }));
            }}
            title="dataEntry:listOfRecords"
            toggleMenu={toggleMenu}
          />
          {fieldManualUrl && (
            <MenuItem
              icon="help"
              onPress={() => {
                WebBrowser.openBrowserAsync(fieldManualUrl);
              }}
              title="surveys:fieldManual"
              toggleMenu={toggleMenu}
            />
          )}
        </>
      )}
      <Divider />
      <MenuItem
        icon="cog"
        onPress={() => {
          navigation.navigate(screenKeys.settings);
        }}
        title="settings:title"
        toggleMenu={toggleMenu}
      />
      <MenuItem
        icon="information-outline"
        onPress={() => {
          navigation.navigate(screenKeys.about);
        }}
        title="common:about"
        toggleMenu={toggleMenu}
      />
      {Environment.isAndroid && (
        <>
          <Divider />
          <MenuItem
            icon="exit-to-app"
            onPress={() => {
              dispatch(
                ConfirmActions.show({
                  titleKey: "app:confirmExit.title",
                  confirmButtonTextKey: "common:exit",
                  messageKey: "app:confirmExit.message",
                  onConfirm: BackHandler.exitApp,
                })
              );
            }}
            title="common:exit"
            toggleMenu={toggleMenu}
          />
        </>
      )}
    </Menu>
  );
};

OptionsMenu.propTypes = {
  toggleMenu: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};
