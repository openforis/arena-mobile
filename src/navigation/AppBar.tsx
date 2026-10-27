import { useCallback, useMemo, useState } from "react";

import { Surveys } from "@openforis/arena-core";

import { AutoSyncStatusAppBarAction } from "appComponents/AutoSyncStatus";
import {
  AppBarAction,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  HView,
  Spacer,
  Text,
} from "components";
import { useScreenKey } from "hooks";
import { MapProvider, RecordEditViewMode, ScreenViewMode } from "model";
import { useIsTextDirectionRtl, useTranslation } from "localization";
import { log, PreviewMode } from "utils";
import { screenKeys } from "screens";
import { hasMapLayers } from "screens/RecordsMap/recordsMapLayers";
import { Breadcrumbs } from "screens/RecordEditor/Breadcrumbs";
import { RecordCompletionProgressBar } from "screens/RecordEditor/RecordCompletionProgressBar";
import {
  DataEntryActions,
  DataEntrySelectors,
  DeviceInfoSelectors,
  ScreenOptionsActions,
  ScreenOptionsSelectors,
  SettingsSelectors,
  SurveyOptionsActions,
  SurveyOptionsSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { BaseStyles } from "utils/BaseStyles";

import { OptionsMenu } from "./OptionsMenu";
import styles from "./styles";

const iconByScreenViewMode: Record<ScreenViewMode, string> = {
  [ScreenViewMode.table]: "table",
  [ScreenViewMode.list]: "view-list",
  [ScreenViewMode.cards]: "view-agenda-outline",
};

type Props = {
  back?: any;
  navigation: any;
  options: any;
};

export const AppBar = (props: Props) => {
  log.debug(`rendering AppBar`);
  const { back, navigation, options } = props;

  const { t } = useTranslation();

  const {
    hasBack,
    hasOptionsMenuVisible,
    hasRecordsMap,
    hasToggleScreenView,
    surveyLabelAsTitle,
    title: titleOption,
    titleParams,
    viewModes,
  } = options;

  const screenKey = useScreenKey();
  const screenViewMode = ScreenOptionsSelectors.useScreenViewMode(screenKey);

  const dispatch = useAppDispatch();
  const isRtl = useIsTextDirectionRtl();
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const recordsMapAvailable = useMemo(
    () =>
      !!hasRecordsMap && !!survey && !!cycle && hasMapLayers({ survey, cycle }),
    [cycle, hasRecordsMap, survey],
  );
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
  const { mapProvider, showRecordCompletion } = SettingsSelectors.useSettings();
  const confirm = useConfirm();

  const [state, setState] = useState({ menuVisible: false });

  const { menuVisible } = state;

  const title =
    surveyLabelAsTitle && survey
      ? Surveys.getLabelOrName(lang)(survey)
      : t(titleOption, titleParams);

  const onToggleDrawerPress = useCallback(
    () => dispatch(DataEntryActions.toggleRecordPageMenuOpen),
    [dispatch],
  );

  const toggleMenu = useCallback(
    () =>
      setState((statePrev) => ({ ...statePrev, menuVisible: !menuVisible })),
    [menuVisible],
  );

  const onMenuDismiss = useCallback(
    () => setState((statePrev) => ({ ...statePrev, menuVisible: false })),
    [],
  );

  const onToggleScreenViewModePress = useCallback(
    () =>
      dispatch(
        ScreenOptionsActions.toggleScreenViewMode({ screenKey, viewModes }),
      ),
    [dispatch, screenKey, viewModes],
  );

  const toggleRecordLock = useCallback(
    () => dispatch(DataEntryActions.toggleRecordEditLock),
    [dispatch],
  );

  const toggleRecordEditViewMode = useCallback(() => {
    dispatch(
      SurveyOptionsActions.setRecordEditViewMode(
        recordEditViewMode === RecordEditViewMode.form
          ? RecordEditViewMode.oneNode
          : RecordEditViewMode.form,
      ),
    );
  }, [dispatch, recordEditViewMode]);

  const onRecordsMapPress = useCallback(async () => {
    const confirmResult = await confirm({
      titleKey: "recordsMap:mapProviderChooser.title",
      confirmButtonTextKey: "recordsMap:mapProviderChooser.show",
      singleChoiceOptions: Object.values(MapProvider).map((provider) => ({
        value: provider,
        label: `settings:mapProvider.options.${provider}`,
      })),
      defaultSingleChoiceValue: mapProvider,
    });
    if (!confirmResult) return;
    navigation.navigate(screenKeys.recordsMap, {
      mapProvider: confirmResult.selectedSingleChoiceValue ?? mapProvider,
    });
  }, [confirm, mapProvider, navigation]);

  const onValidationIconPress = useCallback(
    () => navigation.navigate(screenKeys.recordValidationReport),
    [navigation],
  );

  const onLinkToPreviousCyclePress = useCallback(() => {
    dispatch(
      isLinkedToPreviousCycleRecord
        ? DataEntryActions.unlinkFromRecordInPreviousCycle()
        : DataEntryActions.linkToRecordInPreviousCycle(),
    );
  }, [dispatch, isLinkedToPreviousCycleRecord]);

  return (
    <>
      <AppBarHeader elevated mode={isInTwoRows ? "medium" : "small"}>
        <HView
          style={[
            styles.topBarContainer,
            !isTablet && styles.topBarContainerCompact,
          ]}
          fullWidth
        >
          {editingRecord && (
            <AppBarAction icon="menu" onPress={onToggleDrawerPress} size={36} />
          )}

          {hasBack && back && (
            <AppBarBackAction
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
              {!isTablet && isInTwoRows && (
                <Spacer fullFlex fullWidth={false} />
              )}
              {recordEditLockAvailable && (
                <AppBarAction
                  icon={
                    recordEditLocked
                      ? "lock-outline"
                      : "lock-open-variant-outline"
                  }
                  onPress={toggleRecordLock}
                />
              )}
              {recordIsNotValid && (
                <AppBarAction
                  icon="alert"
                  color={recordHasErrors ? "red" : "orange"}
                  onPress={onValidationIconPress}
                />
              )}
              {canRecordBeLinkedToPreviousCycle && (
                <AppBarAction
                  icon={isLinkedToPreviousCycleRecord ? "link" : "link-off"}
                  loading={isLoadingPreviousCycleRecord}
                  onPress={onLinkToPreviousCyclePress}
                />
              )}
              <AppBarAction
                icon={
                  recordEditViewMode === RecordEditViewMode.form
                    ? "numeric-1-box-outline"
                    : "format-list-bulleted"
                }
                onPress={toggleRecordEditViewMode}
              />
              {!PreviewMode.isActive && <AutoSyncStatusAppBarAction />}
            </>
          )}

          {!editingRecord && recordsMapAvailable && (
            <AppBarAction icon="map-outline" onPress={onRecordsMapPress} />
          )}

          {!editingRecord && hasToggleScreenView && (
            <AppBarAction
              // icon of the view mode the button switches to
              icon={
                iconByScreenViewMode[
                  ScreenOptionsActions.getNextViewMode({
                    viewMode: screenViewMode,
                    viewModes,
                  })
                ]
              }
              onPress={onToggleScreenViewModePress}
            />
          )}

          {hasOptionsMenuVisible && !PreviewMode.isActive && (
            <OptionsMenu
              onDismiss={onMenuDismiss}
              toggleMenu={toggleMenu}
              visible={menuVisible}
            />
          )}
        </HView>
        {isInTwoRows && (
          <AppBarContent
            style={styles.breadcrumbsContent}
            title={<Breadcrumbs />}
          />
        )}
      </AppBarHeader>
      {editingRecord && showRecordCompletion && <RecordCompletionProgressBar />}
    </>
  );
};
