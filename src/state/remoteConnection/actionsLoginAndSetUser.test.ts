import { SecureStoreService, UserService } from "service";

import { loginAndSetUser } from "./actionsLoginAndSetUser";

jest.mock("service", () => ({
  SecureStoreService: { getAuthRefreshToken: jest.fn() },
  UserService: { fetchUser: jest.fn(), fetchLastLoggedInUser: jest.fn() },
}));
jest.mock("utils/Logger");
jest.mock("../autoSync", () => ({
  AutoSyncActions: { reset: () => ({ type: "autoSyncReset" }) },
}));
jest.mock("../deviceInfo/selectors", () => ({
  DeviceInfoSelectors: { selectDeviceInfo: (state: any) => state.deviceInfo },
}));
jest.mock("./selectors", () => ({
  RemoteConnectionSelectors: { selectLoggedUser: (state: any) => state.user },
}));

const cachedUser = { uuid: "cached" };
const remoteUser = { uuid: "remote" };

const getState = () => ({
  deviceInfo: { isNetworkConnected: true },
  user: null,
});

describe("loginAndSetUser", () => {
  beforeEach(() => {
    (SecureStoreService.getAuthRefreshToken as jest.Mock).mockResolvedValue(
      "token",
    );
    (UserService.fetchLastLoggedInUser as jest.Mock).mockResolvedValue(
      cachedUser,
    );
    (UserService.fetchUser as jest.Mock).mockResolvedValue(remoteUser);
  });

  it("keeps the last logged in user while fetching it, then sets the fetched one", async () => {
    const dispatch = jest.fn();

    await loginAndSetUser()(dispatch, getState as any);

    const types = dispatch.mock.calls.map(([action]) => action);
    expect(types[0]).toEqual({ type: "USER_LOADING", user: cachedUser });
    expect(types[1]).toEqual({ type: "USER_SET", user: remoteUser });
  });

  it("shares the request between concurrent calls", async () => {
    const dispatch = jest.fn();

    await Promise.all([
      loginAndSetUser()(dispatch, getState as any),
      loginAndSetUser({ onlyIfNotSet: false })(dispatch, getState as any),
    ]);

    expect(UserService.fetchUser).toHaveBeenCalledTimes(1);
  });
});
