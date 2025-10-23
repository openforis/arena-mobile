import { RemoteService } from "./remoteService";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Environment } from "utils";

let io: any;

if (!Environment.isExpoGo || Environment.isAndroid) {
  io = require("socket.io-client")?.io;
}

let webSocketInstance: any = null;

const EVENTS = {
  jobUpdate: "jobUpdate",
};

const open = async () => {
  close();

  const serverUrl = await RemoteService.getServerUrl();

  webSocketInstance = io?.(serverUrl, { withCredentials: true });

  return webSocketInstance;
};

const close = () => {
  webSocketInstance?.close();
  webSocketInstance = null;
};

export const WebSocketService = {
  EVENTS,

  open,
  close,
};
