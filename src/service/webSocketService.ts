import { AuthService } from "./authService";
import { RemoteService } from "./remoteService";
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
  const authToken = AuthService.getAuthToken();
  const options = {
    withCredentials: true,
    auth: {
      token: authToken,
    },
  };
  webSocketInstance = io?.(serverUrl, options);

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
