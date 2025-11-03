import { combineReducers } from "redux";

import { ConfirmReducer } from "./confirm/reducer";
import { DataEntryReducer } from "./dataEntry/reducer";
import { DeviceInfoReducer } from "./deviceInfo/reducer";
import { JobMonitorReducer } from "./jobMonitor/reducer";
import { MessageReducer } from "./message/reducer";
import { RemoteConnectionReducer } from "./remoteConnection/reducer";
import { ScreenOptionsReducer } from "./screenOptions/reducer";
import { SettingsReducer } from "./settings/reducer";
import { SurveyReducer } from "./survey/reducer";
import { SurveyOptionsReducer } from "./surveyOptions/reducer";
import { ToastReducer } from "./toast/reducer";

export const rootReducer = combineReducers({
  confirm: ConfirmReducer,
  dataEntry: DataEntryReducer,
  deviceInfo: DeviceInfoReducer,
  jobMonitor: JobMonitorReducer,
  message: MessageReducer,
  remoteConnection: RemoteConnectionReducer,
  settings: SettingsReducer,
  screenOptions: ScreenOptionsReducer,
  survey: SurveyReducer,
  surveyOptions: SurveyOptionsReducer,
  toast: ToastReducer,
});
