import HomeScreen from "./HomeScreen";

import AboutScreen from "./AboutScreen";
import CustomMapLayerEditorScreen from "./CustomMapLayerEditorScreen";
import CustomMapLayersScreen from "./CustomMapLayersScreen";
import LocationMapViewerScreen from "./LocationMapViewerScreen";
import OfflineMapAreaEditorScreen from "./OfflineMapAreaEditorScreen";
import OfflineMapAreaViewerScreen from "./OfflineMapAreaViewerScreen";
import OfflineMapsScreen from "./OfflineMapsScreen";
import MapImportScreen from "./MapImportScreen";
import ImportedMapViewerScreen from "./ImportedMapViewerScreen";
import RecordEditorScreen from "./RecordEditorScreen";
import RecordsListScreen from "./RecordsListScreen";
import RecordsMapScreen from "./RecordsMapScreen";
import RecordValidationReportScreen from "./RecordValidationReportScreen";
import SettingsScreen from "./SettingsScreen";
import SettingsRemoteConnectionScreen from "./SettingsRemoteConnectionScreen";
import SurveysListLocalScreen from "./SurveysListLocalScreen";
import SurveysListRemoteScreen from "./SurveysListRemoteScreen";

import { screenKeys } from "./screenKeys";
import { ScreenViewMode } from "model";

const screenDefaults = {
  hasBack: true,
  hasDrawer: true,
  hasOptionsMenuVisible: true,
  surveyLabelAsTitle: false,
};

export const screens = {
  [screenKeys.about]: {
    ...screenDefaults,
    title: "common:about",
    component: AboutScreen,
  },
  [screenKeys.customMapLayers]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:customLayers.title",
    component: CustomMapLayersScreen,
  },
  [screenKeys.customMapLayerEditor]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:customLayers.editor.title",
    component: CustomMapLayerEditorScreen,
  },
  [screenKeys.home]: {
    ...screenDefaults,
    title: "common:appTitle",
    component: HomeScreen,
  },
  [screenKeys.locationMapViewer]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "dataEntry:coordinate.map.viewerTitle",
    component: LocationMapViewerScreen,
  },
  [screenKeys.offlineMaps]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:title",
    component: OfflineMapsScreen,
  },
  [screenKeys.offlineMapAreaEditor]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:areaEditor.title",
    component: OfflineMapAreaEditorScreen,
  },
  [screenKeys.offlineMapAreaViewer]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:areaViewer.title",
    component: OfflineMapAreaViewerScreen,
  },
  [screenKeys.mapImport]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "importedMaps:import.title",
    component: MapImportScreen,
  },
  [screenKeys.importedMapViewer]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "importedMaps:map.viewerTitle",
    component: ImportedMapViewerScreen,
  },
  [screenKeys.recordsList]: {
    ...screenDefaults,
    hasRecordsMap: true,
    hasToggleScreenView: true,
    viewModes: [ScreenViewMode.table, ScreenViewMode.cards],
    title: "dataEntry:listOfRecords",
    component: RecordsListScreen,
  },
  [screenKeys.recordsMap]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "recordsMap:title",
    component: RecordsMapScreen,
  },
  [screenKeys.recordEditor]: {
    ...screenDefaults,
    hasBack: false,
    hasDrawer: true,
    surveyLabelAsTitle: true,
    component: RecordEditorScreen,
  },

  [screenKeys.recordValidationReport]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    title: "dataEntry:validationReport.title",
    component: RecordValidationReportScreen,
  },
  [screenKeys.settings]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "settings:title",
    component: SettingsScreen,
  },
  [screenKeys.settingsRemoteConnection]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "settingsRemoteConnection:title",
    component: SettingsRemoteConnectionScreen,
  },
  [screenKeys.surveysListLocal]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    viewModes: [ScreenViewMode.table, ScreenViewMode.cards],
    title: "surveys:surveysInTheDevice",
    component: SurveysListLocalScreen,
  },
  [screenKeys.surveysListRemote]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    viewModes: [ScreenViewMode.table, ScreenViewMode.cards],
    title: "surveys:surveysInTheCloud",
    component: SurveysListRemoteScreen,
  },
};
