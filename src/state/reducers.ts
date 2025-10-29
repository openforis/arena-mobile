import { combineReducers } from "redux";

import { ConfirmReducer } from "./confirm";
import { DataEntryReducer } from "./dataEntry";
import { DeviceInfoReducer } from "./deviceInfo";
import { JobMonitorReducer } from "./jobMonitor";
import { MessageReducer } from "./message";
import { RemoteConnectionReducer } from "./remoteConnection";
import { ScreenOptionsReducer } from "./screenOptions";
import { SettingsReducer } from "./settings";
import { SurveyReducer } from "./survey";
import { SurveyOptionsReducer } from "./surveyOptions";
import { ToastReducer } from "./toast";

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
