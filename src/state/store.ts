import { combineReducers } from "redux";
import { useDispatch, useSelector } from "react-redux";

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
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
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

export const store = configureStore({ reducer: rootReducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
