import { useCallback, useState } from "react";
import { Appbar as RNPAppbar } from "react-native-paper";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

import { HView, Spacer, Text } from "components";
import { useScreenKey } from "hooks";
import { RecordEditViewMode, ScreenViewMode } from "model";
import { useIsTextDirectionRtl, useTranslation } from "localization";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  ScreenOptionsActions,
  ScreenOptionsSelectors,
  SurveyOptionsActions,
  SurveyOptionsSelectors,
  SurveySelectors,
} from "state";
import { screenKeys } from "screens";
import { Breadcrumbs } from "screens/RecordEditor/Breadcrumbs";
import { OptionsMenu } from "./OptionsMenu";

import styles from "./styles";
import { BaseStyles } from "utils/BaseStyles";

export const AppBar = (props) => {
  if (__DEV__) {
    console.log(`rendering AppBar`);
  }
  const { back, navigation, options } = props;

  const { t } = useTranslation();

  const {
    hasBack,
    hasOptionsMenuVisible,
    hasToggleScreenView,
    surveyLabelAsTitle,
    title: titleOption,
  } = options;

  const screenKey = useScreenKey();
  const screenViewMode = ScreenOptionsSelectors.useScreenViewMode(screenKey);

  const dispatch = useDispatch();
  const isRtl = useIsTextDirectionRtl();
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const editingRecord =
    DataEntrySelectors.useIsEditingRecord() &&
    screenKey === screenKeys.recordEditor;
  const recordEditLockAvailable =
    DataEntrySelectors.useRecordEditLockAvailable();
  const recordEditLocked =
    DataEntrySelectors.useRecordEditLocked() && editingRecord;
  const recordEditViewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const recordHasErrors = DataEntrySelectors.useRecordHasErrors();
  const canRecordBeLinkedToPreviousCycle =
    DataEntrySelectors.useCanRecordBeLinkedToPreviousCycle();
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const isLoadingPreviousCycleRecord =
    DataEntrySelectors.usePreviousCycleRecordLoading();
  const isTablet = DeviceInfoSelectors.useIsTablet();

  const [state, setState] = useState({ menuVisible: false });

  const { menuVisible } = state;

  const title =
    surveyLabelAsTitle && survey
      ? Surveys.getLabelOrName(lang)(survey)
      : t(titleOption);

  const onToggleDrawerPress = useCallback(
    () => dispatch(DataEntryActions.toggleRecordPageMenuOpen),
    [dispatch]
  );

  const toggleMenu = useCallback(
    () =>
      setState((statePrev) => ({ ...statePrev, menuVisible: !menuVisible })),
    [menuVisible]
  );

  const onToggleScreenViewModePress = useCallback(
    () => dispatch(ScreenOptionsActions.toggleScreenViewMode({ screenKey })),
    [dispatch, screenKey]
  );

  const toggleRecordLock = useCallback(
    () => dispatch(DataEntryActions.toggleRecordEditLock),
    [dispatch]
  );

  const toggleRecordEditViewMode = useCallback(() => {
    dispatch(
      SurveyOptionsActions.setRecordEditViewMode(
        recordEditViewMode === RecordEditViewMode.form
          ? RecordEditViewMode.oneNode
          : RecordEditViewMode.form
      )
    );
  }, [dispatch, recordEditViewMode]);

  const onValidationIconPress = useCallback(
    () => navigation.navigate(screenKeys.recordValidationReport),
    [navigation]
  );

  const onLinkToPreviousCyclePress = useCallback(() => {
    dispatch(
      isLinkedToPreviousCycleRecord
        ? DataEntryActions.unlinkFromRecordInPreviousCycle()
        : DataEntryActions.linkToRecordInPreviousCycle()
    );
  }, [dispatch, isLinkedToPreviousCycleRecord]);

  return (
    <RNPAppbar.Header elevated mode={editingRecord ? "medium" : "small"}>
      <HView style={styles.topBarContainer} fullWidth transparent>
        {editingRecord && (
          <RNPAppbar.Action
            icon="menu"
            onPress={onToggleDrawerPress}
            size={36}
          />
        )}

        {hasBack && back && (
          <RNPAppbar.BackAction
            onPress={navigation.goBack}
            size={36}
            style={isRtl ? BaseStyles.mirrorX : undefined}
          />
        )}

        {(!editingRecord || isTablet) && (
          <Text
            numberOfLines={editingRecord ? 1 : undefined}
            style={styles.title}
            variant="titleLarge"
          >
            {title}
          </Text>
        )}

        {editingRecord && (
          <>
            {!isTablet && <Spacer fullFlex fullWidth={false} />}
            {recordEditLockAvailable && (
              <RNPAppbar.Action
                icon={
                  recordEditLocked
                    ? "lock-outline"
                    : "lock-open-variant-outline"
                }
                onPress={toggleRecordLock}
              />
            )}
            {recordHasErrors && (
              <RNPAppbar.Action icon="alert" onPress={onValidationIconPress} />
            )}
            {canRecordBeLinkedToPreviousCycle && (
              <RNPAppbar.Action
                icon={isLinkedToPreviousCycleRecord ? "link" : "link-off"}
                loading={isLoadingPreviousCycleRecord}
                onPress={onLinkToPreviousCyclePress}
              />
            )}
            <RNPAppbar.Action
              icon={
                recordEditViewMode === RecordEditViewMode.form
                  ? "numeric-1-box-outline"
                  : "format-list-bulleted"
              }
              onPress={toggleRecordEditViewMode}
            />
          </>
        )}

        {!editingRecord && hasToggleScreenView && (
          <RNPAppbar.Action
            icon={
              screenViewMode === ScreenViewMode.list ? "table" : "view-list"
            }
            onPress={onToggleScreenViewModePress}
          />
        )}

        {hasOptionsMenuVisible && (
          <OptionsMenu toggleMenu={toggleMenu} visible={menuVisible} />
        )}
      </HView>
      {editingRecord && (
        <RNPAppbar.Content title={<Breadcrumbs />}></RNPAppbar.Content>
      )}
    </RNPAppbar.Header>
  );
};

AppBar.propTypes = {
  back: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
};
