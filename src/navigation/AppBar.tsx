import { useCallback, useState } from "react";
import { Appbar as RNPAppbar } from "react-native-paper";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { HView, Spacer, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useScreenKey } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordEditViewMode, ScreenViewMode } from "model";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl, useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'screens' or its corresponding ... Remove this comment to see the full error message
import { screenKeys } from "screens";
// @ts-expect-error TS(2307): Cannot find module 'screens/RecordEditor/Breadcrum... Remove this comment to see the full error message
import { Breadcrumbs } from "screens/RecordEditor/Breadcrumbs";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  ScreenOptionsActions,
  ScreenOptionsSelectors,
  SurveyOptionsActions,
  SurveyOptionsSelectors,
  SurveySelectors,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";
// @ts-expect-error TS(2307): Cannot find module 'utils/BaseStyles' or its corre... Remove this comment to see the full error message
import { BaseStyles } from "utils/BaseStyles";

import { OptionsMenu } from "./OptionsMenu";
import styles from "./styles";

export const AppBar = (props: any) => {
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
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();
  const isTablet = DeviceInfoSelectors.useIsTablet();
  const editingRecord =
    DataEntrySelectors.useIsEditingRecord() &&
    screenKey === screenKeys.recordEditor;
  const recordEditLockAvailable =
    DataEntrySelectors.useRecordEditLockAvailable();
  const recordEditLocked =
    DataEntrySelectors.useRecordEditLocked() && editingRecord;
  const recordEditViewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const recordIsNotValid = DataEntrySelectors.useRecordIsNotValid();
  const recordHasErrors = DataEntrySelectors.useRecordHasErrors();
  const canRecordBeLinkedToPreviousCycle =
    DataEntrySelectors.useCanRecordBeLinkedToPreviousCycle();
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const isLoadingPreviousCycleRecord =
    DataEntrySelectors.usePreviousCycleRecordLoading();
  const isInTwoRows = editingRecord && !isLandscape;

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
    <RNPAppbar.Header elevated mode={isInTwoRows ? "medium" : "small"}>
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
            {!isInTwoRows && <Breadcrumbs />}
            {!isTablet && isInTwoRows && <Spacer fullFlex fullWidth={false} />}
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
            {recordIsNotValid && (
              <RNPAppbar.Action
                icon="alert"
                color={recordHasErrors ? "red" : "orange"}
                onPress={onValidationIconPress}
              />
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
          // @ts-expect-error TS(2786): 'OptionsMenu' cannot be used as a JSX component.
          <OptionsMenu toggleMenu={toggleMenu} visible={menuVisible} />
        )}
      </HView>
      {isInTwoRows && (
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
