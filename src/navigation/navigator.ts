import { useMemo } from "react";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { screenKeys } from "screens/screenKeys";
import type { CustomMapLayerEditorParams } from "screens/CustomMapLayerEditor/CustomMapLayerEditorScreen";
import type { LocationMapViewerParams } from "screens/LocationMapViewer/LocationMapViewerScreen";
import type { OfflineMapAreaViewerParams } from "screens/OfflineMapAreaViewer/OfflineMapAreaViewerScreen";
import type { OfflineMapsTab } from "screens/OfflineMaps/OfflineMapsScreen";
import type { MapImportParams } from "screens/MapImport/MapImportScreen";
import type { ImportedMapViewerParams } from "screens/ImportedMapViewer/ImportedMapViewerScreen";
import type { RecordsMapParams } from "screens/RecordsMap/RecordsMapScreen";

export type AppStackParamList = {
  [screenKeys.about]: undefined;
  [screenKeys.customMapLayerEditor]: CustomMapLayerEditorParams | undefined;
  [screenKeys.customMapLayers]: undefined;
  [screenKeys.home]: undefined;
  [screenKeys.locationMapViewer]: LocationMapViewerParams;
  [screenKeys.offlineMapAreaEditor]: undefined;
  [screenKeys.offlineMapAreaViewer]: OfflineMapAreaViewerParams;
  [screenKeys.offlineMaps]: { initialTab?: OfflineMapsTab } | undefined;
  [screenKeys.mapImport]: MapImportParams;
  [screenKeys.importedMapViewer]: ImportedMapViewerParams;
  [screenKeys.recordsList]: undefined;
  [screenKeys.recordsMap]: RecordsMapParams | undefined;
  [screenKeys.recordEditor]: undefined;
  [screenKeys.recordValidationReport]: undefined;
  [screenKeys.settings]: undefined;
  [screenKeys.settingsRemoteConnection]: undefined;
  [screenKeys.surveysListLocal]: undefined;
  [screenKeys.surveysListRemote]: undefined;
};

type AppNavigation = NavigationProp<AppStackParamList>;

// the navigation object of any navigator in the app stack
export const createNavigator = (
  navigation: NavigationProp<ParamListBase> | ReturnType<typeof useNavigation>,
) => {
  const nav = navigation as unknown as AppNavigation;
  return {
    addListener: (type: "focus" | "blur", handler: () => void) =>
      nav.addListener(type, handler),
    getState: () => nav.getState(),
    goBack: () => nav.goBack(),
    setOptions: (options: Record<string, unknown>) => nav.setOptions(options),
    navigateToAbout: () => nav.navigate(screenKeys.about),
    navigateToCustomMapLayerEditor: (params?: CustomMapLayerEditorParams) =>
      nav.navigate(screenKeys.customMapLayerEditor, params),
    navigateToCustomMapLayers: () => nav.navigate(screenKeys.customMapLayers),
    navigateToLocationMapViewer: (params: LocationMapViewerParams) =>
      nav.navigate(screenKeys.locationMapViewer, params),
    navigateToOfflineMapAreaEditor: () =>
      nav.navigate(screenKeys.offlineMapAreaEditor),
    navigateToOfflineMapAreaViewer: (params: OfflineMapAreaViewerParams) =>
      nav.navigate(screenKeys.offlineMapAreaViewer, params),
    navigateToOfflineMaps: (params?: { initialTab?: OfflineMapsTab }) =>
      nav.navigate(screenKeys.offlineMaps, params),
    navigateToMapImport: (params: MapImportParams) =>
      nav.navigate(screenKeys.mapImport, params),
    navigateToImportedMapViewer: (params: ImportedMapViewerParams) =>
      nav.navigate(screenKeys.importedMapViewer, params),
    navigateToRecordEditor: () => nav.navigate(screenKeys.recordEditor),
    // pop: go back to the existing records list instead of pushing a new one
    navigateToRecordsList: ({ pop = false }: { pop?: boolean } = {}) =>
      nav.navigate(screenKeys.recordsList, undefined, { pop }),
    navigateToRecordsMap: (params?: RecordsMapParams) =>
      nav.navigate(screenKeys.recordsMap, params),
    navigateToRecordValidationReport: () =>
      nav.navigate(screenKeys.recordValidationReport),
    navigateToSettings: () => nav.navigate(screenKeys.settings),
    navigateToSettingsRemoteConnection: () =>
      nav.navigate(screenKeys.settingsRemoteConnection),
    navigateToSurveysListLocal: () => nav.navigate(screenKeys.surveysListLocal),
    navigateToSurveysListRemote: () =>
      nav.navigate(screenKeys.surveysListRemote),
  };
};

export type Navigator = ReturnType<typeof createNavigator>;

export const useNavigator = (): Navigator => {
  const navigation = useNavigation();
  return useMemo(() => createNavigator(navigation), [navigation]);
};

// Partial: a screen can be opened without (some of) its params
export const useScreenParams = <K extends keyof AppStackParamList>(): Partial<
  NonNullable<AppStackParamList[K]>
> => (useRoute().params ?? {}) as Partial<NonNullable<AppStackParamList[K]>>;
