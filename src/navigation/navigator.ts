import { useMemo } from "react";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { screenKeys } from "screens/screenKeys";
import type { CustomMapLayerEditorParams } from "screens/CustomMapLayerEditor/CustomMapLayerEditorScreen";
import type { LocationMapViewerParams } from "screens/LocationMapViewer/LocationMapViewerScreen";
import type { OfflineMapAreaViewerParams } from "screens/OfflineMapAreaViewer/OfflineMapAreaViewerScreen";
import type { OfflineMapsTab } from "screens/OfflineMaps/OfflineMapsScreen";
import type { PdfMapImportParams } from "screens/PdfMapImport/PdfMapImportScreen";
import type { PdfMapViewerParams } from "screens/PdfMapViewer/PdfMapViewerScreen";
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
  [screenKeys.pdfMapImport]: PdfMapImportParams;
  [screenKeys.pdfMapViewer]: PdfMapViewerParams;
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

export const createNavigator = (navigation: any) => {
  const nav = navigation as AppNavigation;
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
    navigateToPdfMapImport: (params: PdfMapImportParams) =>
      nav.navigate(screenKeys.pdfMapImport, params),
    navigateToPdfMapViewer: (params: PdfMapViewerParams) =>
      nav.navigate(screenKeys.pdfMapViewer, params),
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
