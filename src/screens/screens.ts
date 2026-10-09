import HomeScreen from "./HomeScreen";

import AboutScreen from "./AboutScreen";
import CustomMapLayerEditor from "./CustomMapLayerEditor";
import CustomMapLayers from "./CustomMapLayers";
import LocationMapViewer from "./LocationMapViewer";
import OfflineMapAreaEditor from "./OfflineMapAreaEditor";
import OfflineMapAreaViewer from "./OfflineMapAreaViewer";
import OfflineMaps from "./OfflineMaps";
import RecordEditor from "./RecordEditor";
import RecordsList from "./RecordsList";
import RecordValidationReport from "./RecordValidationReport";
import SettingsScreen from "./SettingsScreen";
import SettingsRemoteConnectionScreen from "./SettingsRemoteConnectionScreen";
import SurveysListLocal from "./SurveysListLocal";
import SurveysListRemote from "./SurveysListRemote";

import { screenKeys } from "./screenKeys";

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
    component: CustomMapLayers,
  },
  [screenKeys.customMapLayerEditor]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:customLayers.editor.title",
    component: CustomMapLayerEditor,
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
    component: LocationMapViewer,
  },
  [screenKeys.offlineMaps]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:title",
    component: OfflineMaps,
  },
  [screenKeys.offlineMapAreaEditor]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:areaEditor.title",
    component: OfflineMapAreaEditor,
  },
  [screenKeys.offlineMapAreaViewer]: {
    ...screenDefaults,
    hasOptionsMenuVisible: false,
    title: "offlineMaps:areaViewer.title",
    component: OfflineMapAreaViewer,
  },
  [screenKeys.recordsList]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    title: "dataEntry:listOfRecords",
    component: RecordsList,
  },
  [screenKeys.recordEditor]: {
    ...screenDefaults,
    hasBack: false,
    hasDrawer: true,
    surveyLabelAsTitle: true,
    component: RecordEditor,
  },

  [screenKeys.recordValidationReport]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    title: "dataEntry:validationReport.title",
    component: RecordValidationReport,
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
    title: "surveys:surveysInTheDevice",
    component: SurveysListLocal,
  },
  [screenKeys.surveysListRemote]: {
    ...screenDefaults,
    hasToggleScreenView: true,
    title: "surveys:surveysInTheCloud",
    component: SurveysListRemote,
  },
};
