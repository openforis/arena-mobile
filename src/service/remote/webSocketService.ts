import type { io as socketIo, Socket } from "socket.io-client";

import { AuthService } from "../auth/authService";
import { RemoteService } from "./remoteService";
import { Environment } from "utils";

let io: typeof socketIo | undefined;

if (!Environment.isExpoGo || Environment.isAndroid) {
  io = require("socket.io-client")?.io;
}

let webSocketInstance: Socket | null | undefined = null;

const EVENTS = {
  jobUpdate: "jobUpdate",
};

// undefined when socket.io is not available (Expo Go on iOS)
const open = async (): Promise<Socket | undefined> => {
  close();

  const serverUrl = await RemoteService.getServerUrl();
  const authToken = AuthService.getAuthToken();
  const options = {
    withCredentials: true,
    auth: {
      token: authToken,
    },
  };
  const socket = io?.(serverUrl, options);
  webSocketInstance = socket;
  return socket;
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
