import { useDispatch } from "react-redux";
import { Appbar as RNPAppbar, Divider, Menu } from "react-native-paper";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { MenuItem } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useScreenKey } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'screens' or its corresponding ... Remove this comment to see the full error message
import { screenKeys } from "screens";
import {
  ConfirmActions,
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Environment } from "utils";

import { UserSummary } from "./UserSummary";

export const OptionsMenu = (props: any) => {
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
    // @ts-expect-error TS(2749): 'Menu' refers to a value, but is being used as a t... Remove this comment to see the full error message
    <Menu
      // @ts-expect-error TS(7027): Unreachable code detected.
      anchor={<RNPAppbar.Action icon="dots-vertical" onPress={toggleMenu} />}
      // @ts-expect-error TS(2304): Cannot find name 'onDismiss'.
      onDismiss={toggleMenu}
      // @ts-expect-error TS(2304): Cannot find name 'visible'.
      visible={visible}
    >
      // @ts-expect-error TS(2709): Cannot use namespace 'UserSummary' as a type.
      <UserSummary
        // @ts-expect-error TS(2304): Cannot find name 'navigation'.
        navigation={navigation}
        // @ts-expect-error TS(2304): Cannot find name 'onButtonPress'.
        onButtonPress={() => toggleMenu()}
        // @ts-expect-error TS(2304): Cannot find name 'profileIconSize'.
        profileIconSize={40}
        // @ts-expect-error TS(2304): Cannot find name 'showLogoutButton'.
        showLogoutButton={false}
      />

      // @ts-expect-error TS(2749): 'Divider' refers to a value, but is being used as ... Remove this comment to see the full error message
      <Divider />

      // @ts-expect-error TS(2304): Cannot find name 'editingRecord'.
      {!editingRecord && (
        <MenuItem
          // @ts-expect-error TS(2304): Cannot find name 'icon'.
          icon="view-list"
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          onPress={() => {
            // @ts-expect-error TS(2304): Cannot find name 'navigation'.
            navigation.navigate(screenKeys.surveysListLocal);
          }}
          // @ts-expect-error TS(2304): Cannot find name 'title'.
          title="surveys:title"
          // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
          toggleMenu={toggleMenu}
        />
      )}
      // @ts-expect-error TS(2304): Cannot find name 'editingRecord'.
      {editingRecord && (
        <>
          <MenuItem
            // @ts-expect-error TS(2304): Cannot find name 'icon'.
            icon="view-list"
            // @ts-expect-error TS(2304): Cannot find name 'onPress'.
            onPress={() => {
              // @ts-expect-error TS(2304): Cannot find name 'dispatch'.
              dispatch(DataEntryActions.navigateToRecordsList({ navigation }));
            }}
            // @ts-expect-error TS(2304): Cannot find name 'title'.
            title="dataEntry:listOfRecords"
            // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
            toggleMenu={toggleMenu}
          />
          // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
          {fieldManualUrl && (
            <MenuItem
              // @ts-expect-error TS(2304): Cannot find name 'icon'.
              icon="help"
              // @ts-expect-error TS(2304): Cannot find name 'onPress'.
              onPress={() => {
                // @ts-expect-error TS(2304): Cannot find name 'fieldManualUrl'.
                WebBrowser.openBrowserAsync(fieldManualUrl);
              }}
              // @ts-expect-error TS(2304): Cannot find name 'title'.
              title="surveys:fieldManual"
              // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
              toggleMenu={toggleMenu}
            />
          )}
        </>
      )}
      // @ts-expect-error TS(2749): 'Divider' refers to a value, but is being used as ... Remove this comment to see the full error message
      <Divider />
      <MenuItem
        // @ts-expect-error TS(2304): Cannot find name 'icon'.
        icon="cog"
        // @ts-expect-error TS(2304): Cannot find name 'onPress'.
        onPress={() => {
          // @ts-expect-error TS(2304): Cannot find name 'navigation'.
          navigation.navigate(screenKeys.settings);
        }}
        // @ts-expect-error TS(2304): Cannot find name 'title'.
        title="settings:title"
        // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
        toggleMenu={toggleMenu}
      />
      <MenuItem
        // @ts-expect-error TS(2304): Cannot find name 'icon'.
        icon="information-outline"
        // @ts-expect-error TS(2304): Cannot find name 'onPress'.
        onPress={() => {
          // @ts-expect-error TS(2304): Cannot find name 'navigation'.
          navigation.navigate(screenKeys.about);
        }}
        // @ts-expect-error TS(2304): Cannot find name 'title'.
        title="common:about"
        // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
        toggleMenu={toggleMenu}
      />
      {Environment.isAndroid && (
        <>
          // @ts-expect-error TS(2749): 'Divider' refers to a value, but is being used as ... Remove this comment to see the full error message
          <Divider />
          <MenuItem
            icon="exit-to-app"
            // @ts-expect-error TS(2349): This expression is not callable.
            onPress={() => {
              // @ts-expect-error TS(2304): Cannot find name 'dispatch'.
              dispatch(
                ConfirmActions.show({
                  titleKey: "app:confirmExit.title",
                  confirmButtonTextKey: "common:exit",
                  messageKey: "app:confirmExit.message",
                  onConfirm: BackHandler.exitApp,
                })
              );
            }}
            // @ts-expect-error TS(2304): Cannot find name 'title'.
            title="common:exit"
            // @ts-expect-error TS(2304): Cannot find name 'toggleMenu'.
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
