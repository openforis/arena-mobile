import { ImageUtils } from "utils/ImageUtils";
import { API } from "./api";
import { RemoteService } from "./remoteService";
import { SecureStoreService } from "./SecureStoreService";

const sIdCookiePrefix = "connect.sid=";

const extractConnectSID = (headers) => {
  const cookie = headers?.map["set-cookie"];
  return cookie?.substring(
    sIdCookiePrefix.length,
    cookie.indexOf(";", sIdCookiePrefix.length)
  );
};

const fetchUser = async () => {
  const { data } = await RemoteService.get("/auth/user");
  return data.user;
};

const fetchUserPicture = async (userUuid) => {
  const fileUri = await RemoteService.getFile(
    `/api/user/${userUuid}/profilePicture`
  );
  return (await ImageUtils.isValid(fileUri)) ? fileUri : null;
};

const login = async ({ serverUrl: serverUrlParam, email, password }) => {
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
    const res = await RemoteService.post("/auth/logout");
    return res?.data;
  } catch (err) {
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
