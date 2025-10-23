import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import MenuDrawer from "react-native-side-drawer";

import { HView, VView, View } from "components";
import { useIsTextDirectionRtl } from "localization";
import { RecordEditViewMode } from "model";
import { useBackHandler, useNavigationIsFocused } from "hooks";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
} from "state";

import { BottomNavigationBar } from "./BottomNavigationBar";
import { RecordPageForm } from "./RecordPageForm";
import { RecordEditorDrawer } from "./RecordEditorDrawer";
import { RecordNodesCarousel } from "./RecordNodesCarousel";
import { StatusBar } from "./StatusBar";

import styles from "./styles.js";

export const RecordEditor = () => {
  if (__DEV__) {
    console.log(`rendering RecordEditor`);
  }
  const dispatch = useDispatch();
  const pageSelectorOpen = DataEntrySelectors.useIsRecordPageSelectorMenuOpen();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const { showStatusBar } = SettingsSelectors.useSettings();
  const navigation = useNavigation();
  const isNavigationFocused = useNavigationIsFocused();
  const isRtl = useIsTextDirectionRtl();

  const onBack = useCallback(() => {
    if (isNavigationFocused) {
      dispatch(DataEntryActions.navigateToRecordsList({ navigation }));
      return true; // the event will not be bubbled up & no other back action will execute
    }
  }, [dispatch, isNavigationFocused, navigation]);

  useBackHandler(onBack);

  const isPhone = DeviceInfoSelectors.useIsPhone();

  const onInternalContainerPress = useCallback(() => {
    if (isPhone) {
      dispatch(DataEntryActions.toggleRecordPageMenuOpen);
    }
  }, [dispatch, isPhone]);

  const veryInternalContainer = (
    <VView
      fullFlex
      pointerEvents={
        // prevent user interaction with internal container when drawer is open
        isPhone && pageSelectorOpen ? "none" : undefined
      }
    >
      {viewMode === RecordEditViewMode.form ? (
        <RecordPageForm />
      ) : (
        <RecordNodesCarousel />
      )}
      {showStatusBar && <StatusBar />}
      <BottomNavigationBar />
    </VView>
  );

  const internalContainer = isPhone ? (
    <Pressable
      disabled={!pageSelectorOpen}
      onPress={onInternalContainerPress}
      pointerEvents={pageSelectorOpen ? undefined : "auto"}
      style={styles.internalContainer}
    >
      {veryInternalContainer}
    </Pressable>
  ) : (
    veryInternalContainer
  );

  if (isPhone) {
    return (
      <MenuDrawer
        animationTime={250}
        drawerContent={<RecordEditorDrawer />}
        drawerPercentage={75}
        opacity={0.4}
        open={pageSelectorOpen}
        overlay
        position={isRtl ? "right" : "left"}
      >
        {internalContainer}
      </MenuDrawer>
    );
  }
  return (
    <HView style={styles.externalContainerInTablet}>
      {pageSelectorOpen && (
        <View style={styles.drawerWrapperInTablet}>
          <RecordEditorDrawer />
        </View>
      )}
      <View
        style={
          pageSelectorOpen
            ? styles.internalContainerWrapperInTabletPageSelectorOpen
            : styles.internalContainerWrapperInTablet
        }
      >
        {internalContainer}
      </View>
    </HView>
  );
};
