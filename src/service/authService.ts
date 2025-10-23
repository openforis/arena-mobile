import { ImageUtils } from "utils/ImageUtils";
import { API } from "./api";
import { RemoteService } from "./remoteService";
import { SecureStoreService } from "./SecureStoreService";

const sIdCookiePrefix = "connect.sid=";

const extractConnectSID = (headers: any) => {
  const cookies = headers?.["set-cookie"];
  const cookie = cookies?.[0];
  return cookie?.substring(
    sIdCookiePrefix.length,
    cookie.indexOf(";", sIdCookiePrefix.length)
  );
};

const fetchUser = async () => {
  // @ts-expect-error TS(2554): Expected 2-3 arguments, but got 1.
  const { data } = await RemoteService.get("/auth/user");
  return data.user;
};

const fetchUserPicture = async (userUuid: any) => {
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 1.
  const fileUri = await RemoteService.getFile(
    `/api/user/${userUuid}/profilePicture`
  );
  return (await ImageUtils.isValid(fileUri)) ? fileUri : null;
};

const login = async ({
  serverUrl: serverUrlParam,
  email,
  password
}: any) => {
  const serverUrl = serverUrlParam ?? (await RemoteService.getServerUrl());
  try {
    const { data, response } = await API.post(serverUrl, "/auth/login", {
      email,
      password,
    });
    const { headers } = response;
    const connectSID = extractConnectSID(headers);
    if (connectSID) {
      await SecureStoreService.setConnectSIDCookie(connectSID);
      return data;
    }
    return { error: "authService:error.invalidCredentials" };
  } catch (err) {
    // @ts-expect-error TS(2339): Property 'response' does not exist on type 'unknow... Remove this comment to see the full error message
    const { response } = err;
    if (!response) {
      return { error: "authService:error.invalidServerUrl" };
    }
    if (response.status === 401) {
      return { error: "authService:error.invalidCredentials" };
    }
    return { error: err };
  }
};

const logout = async () => {
  try {
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    const res = await RemoteService.post("/auth/logout");
    return res?.data;
  } catch (err) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (!err.response) {
      return { error: "authService:error.invalidServerUrl" };
    }
    return { error: err };
  }
};

export const AuthService = {
  fetchUser,
  fetchUserPicture,
  login,
  logout,
};
