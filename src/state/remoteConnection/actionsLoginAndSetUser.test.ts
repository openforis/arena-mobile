import { ArenaUser } from "@openforis/arena-core";

import type { AppGetState } from "state/store";

import { SecureStoreService, UserService } from "service";

import { loginAndSetUser } from "./actionsLoginAndSetUser";
import { RemoteConnectionSliceActions } from "./reducer";

jest.mock("service", () => ({
  SecureStoreService: { getAuthRefreshToken: jest.fn() },
  UserService: { fetchUser: jest.fn(), fetchLastLoggedInUser: jest.fn() },
}));
jest.mock("utils/Logger");
jest.mock("../autoSync", () => ({
  AutoSyncActions: { reset: () => ({ type: "autoSyncReset" }) },
}));
jest.mock("../deviceInfo/selectors", () => ({
  DeviceInfoSelectors: {
    selectDeviceInfo: (state: { deviceInfo: unknown }) => state.deviceInfo,
  },
}));
jest.mock("./selectors", () => ({
  RemoteConnectionSelectors: {
    selectLoggedUser: (state: { user: unknown }) => state.user,
  },
}));

const cachedUser = { uuid: "cached" } as unknown as ArenaUser;
const remoteUser = { uuid: "remote" } as unknown as ArenaUser;

// only the state read by the mocked selectors
const getState = (() => ({
  deviceInfo: { isNetworkConnected: true },
  user: null,
})) as unknown as AppGetState;

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

    await loginAndSetUser()(dispatch, getState);

    const types = dispatch.mock.calls.map(([action]) => action);
    expect(types[0]).toEqual(
      RemoteConnectionSliceActions.userLoading(cachedUser),
    );
    expect(types[1]).toEqual(RemoteConnectionSliceActions.userSet(remoteUser));
  });

  it("shares the request between concurrent calls", async () => {
    const dispatch = jest.fn();

    await Promise.all([
      loginAndSetUser()(dispatch, getState),
      loginAndSetUser({ onlyIfNotSet: false })(dispatch, getState),
    ]);

    expect(UserService.fetchUser).toHaveBeenCalledTimes(1);
  });
});
