import { useCallback, useMemo, useState } from "react";

import { Surveys } from "@openforis/arena-core";

import {
  AppBarAction,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  HView,
  Text,
} from "components";
import { useScreenKey } from "hooks";
import { MapProvider, ScreenViewMode } from "model";
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
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { BaseStyles } from "utils/BaseStyles";

import { createNavigator } from "./navigator";
import { OptionsMenu } from "./OptionsMenu";
import { RecordEditorAppBarActions } from "./RecordEditorAppBarActions";
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

type AppBarInternalProps = Props & {
  editingRecord: boolean;
  isInTwoRows: boolean;
  screenKey: string;
};

const AppBarInternal = (props: AppBarInternalProps) => {
  log.debug(`rendering AppBar`);
  const { back, editingRecord, isInTwoRows, navigation, options, screenKey } =
    props;
  const navigator = useMemo(() => createNavigator(navigation), [navigation]);

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
  const isTablet = DeviceInfoSelectors.useIsTablet();
  const mapProvider = SettingsSelectors.useMapProvider();
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
    navigator.navigateToRecordsMap({
      mapProvider:
        (confirmResult.selectedSingleChoiceValue as MapProvider | undefined) ??
        mapProvider,
    });
  }, [confirm, mapProvider, navigator]);

  return (
    <AppBarHeader elevated mode={isInTwoRows ? "medium" : "small"}>
      <HView
        style={
          isTablet ? styles.topBarContainer : styles.topBarContainerCompact
        }
        fullWidth
      >
        {editingRecord && (
          <AppBarAction
            icon="menu"
            onPress={onToggleDrawerPress}
            size={36}
            testID="app-bar-drawer-button"
          />
        )}

        {hasBack && back && (
          <AppBarBackAction
            onPress={navigator.goBack}
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
          <RecordEditorAppBarActions
            isInTwoRows={isInTwoRows}
            isTablet={isTablet}
            navigator={navigator}
          />
        )}

        {!editingRecord && recordsMapAvailable && (
          <AppBarAction
            icon="map-outline"
            onPress={onRecordsMapPress}
            testID="app-bar-records-map-button"
          />
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
            testID="app-bar-screen-view-mode-button"
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
  );
};

const RecordEditorAppBar = (props: Props) => {
  const editingRecord = DataEntrySelectors.useIsEditingRecord();
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();
  const showRecordCompletion = SettingsSelectors.useShowRecordCompletion();

  return (
    <>
      <AppBarInternal
        {...props}
        editingRecord={editingRecord}
        isInTwoRows={editingRecord && !isLandscape}
        screenKey={screenKeys.recordEditor}
      />
      {editingRecord && showRecordCompletion && <RecordCompletionProgressBar />}
    </>
  );
};

export const AppBar = (props: Props) => {
  const screenKey = useScreenKey();
  return screenKey === screenKeys.recordEditor ? (
    <RecordEditorAppBar {...props} />
  ) : (
    <AppBarInternal
      {...props}
      editingRecord={false}
      isInTwoRows={false}
      screenKey={screenKey}
    />
  );
};
