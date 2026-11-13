const mockWatchPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  Accuracy: { BestForNavigation: 6 },
  watchPositionAsync: (...args: any[]) => mockWatchPositionAsync(...args),
}));
jest.mock("localization", () => ({ changeLanguage: jest.fn() }));
jest.mock("model", () => ({
  SettingsModel: {
    SettingKey: {
      language: "language",
      locationGpsLocked: "locationGpsLocked",
    },
  },
}));
jest.mock("service", () => ({
  CustomMapLayersService: {},
  PdfMapsService: {},
  SettingsService: {
    updateSetting: async ({ key, value }: any) => ({ [key]: value }),
  },
}));
jest.mock("utils", () => ({
  Permissions: { requestLocationForegroundPermission: async () => true },
}));
jest.mock("../toast", () => ({ ToastActions: { show: jest.fn() } }));

import { SettingsActions } from "./actions";

const createSubscription = () => ({ remove: jest.fn() });

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const dispatch: any = (action: any) =>
  typeof action === "function" ? action(dispatch) : action;

const setGpsLocked = (value: boolean) =>
  dispatch(
    SettingsActions.updateSetting({
      key: "locationGpsLocked",
      value,
    }),
  );

describe("GPS locking", () => {
  beforeEach(async () => {
    await setGpsLocked(false);
    mockWatchPositionAsync.mockReset();
  });

  test("uses a 1 s time interval", async () => {
    mockWatchPositionAsync.mockResolvedValue(createSubscription());
    await dispatch(SettingsActions.startGpsLocking());
    expect(mockWatchPositionAsync.mock.calls[0][0].timeInterval).toBe(1000);
  });

  test("starting it twice keeps only one watch", async () => {
    const sub1 = createSubscription();
    const sub2 = createSubscription();
    mockWatchPositionAsync
      .mockResolvedValueOnce(sub1)
      .mockResolvedValueOnce(sub2);
    await dispatch(SettingsActions.startGpsLocking());
    await dispatch(SettingsActions.startGpsLocking());
    expect(sub1.remove).toHaveBeenCalledTimes(1);
    expect(sub2.remove).not.toHaveBeenCalled();
    await setGpsLocked(false);
    expect(sub2.remove).toHaveBeenCalledTimes(1);
  });

  test("a start superseded by a stop while pending drops its watch", async () => {
    const sub = createSubscription();
    const pending = deferred<typeof sub>();
    mockWatchPositionAsync.mockReturnValueOnce(pending.promise);
    const startPromise = dispatch(SettingsActions.startGpsLocking());
    await setGpsLocked(false);
    pending.resolve(sub);
    await startPromise;
    expect(sub.remove).toHaveBeenCalledTimes(1);
  });
});
