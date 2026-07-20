import { log } from "../utils";

import { handleExternalGpsDisconnect } from "./useLocationWatchDisconnect";

jest.mock("../utils", () => ({
  log: {
    warn: jest.fn(),
  },
}));

jest.mock("../service/externalGps/ExternalGpsService", () => ({
  ExternalGpsService: {
    internalGpsSourceId: "internal",
  },
}));

describe("handleExternalGpsDisconnect", () => {
  it("marks the source unavailable when the current session should not fall back", async () => {
    const stopLocationWatch = jest.fn();
    const startInternalGpsWatch = jest.fn().mockResolvedValue(true);
    const activateWatchingState = jest.fn();
    const markSourceUnavailable = jest.fn();

    await handleExternalGpsDisconnect({
      isWatching: true,
      shouldFallbackToInternal: false,
      stopLocationWatch,
      startInternalGpsWatch,
      activateWatchingState,
      markSourceUnavailable,
    });

    expect(log.warn).toHaveBeenCalledWith(
      "Location watch: external GPS connection disconnected mid-session",
    );
    expect(stopLocationWatch).toHaveBeenCalledTimes(1);
    expect(startInternalGpsWatch).not.toHaveBeenCalled();
    expect(activateWatchingState).not.toHaveBeenCalled();
    expect(markSourceUnavailable).toHaveBeenCalledTimes(1);
  });

  it("falls back to internal GPS when the session is allowed to fallback", async () => {
    const stopLocationWatch = jest.fn();
    const startInternalGpsWatch = jest.fn().mockResolvedValue(true);
    const activateWatchingState = jest.fn();
    const markSourceUnavailable = jest.fn();

    await handleExternalGpsDisconnect({
      isWatching: true,
      shouldFallbackToInternal: true,
      stopLocationWatch,
      startInternalGpsWatch,
      activateWatchingState,
      markSourceUnavailable,
    });

    expect(stopLocationWatch).toHaveBeenCalledTimes(1);
    expect(startInternalGpsWatch).toHaveBeenCalledTimes(1);
    expect(activateWatchingState).toHaveBeenCalledWith({
      activeSourceId: "internal",
      sourceUnavailable: true,
    });
    expect(markSourceUnavailable).not.toHaveBeenCalled();
  });

  it("marks the source unavailable when the internal fallback cannot start", async () => {
    const stopLocationWatch = jest.fn();
    const startInternalGpsWatch = jest.fn().mockResolvedValue(false);
    const activateWatchingState = jest.fn();
    const markSourceUnavailable = jest.fn();

    await handleExternalGpsDisconnect({
      isWatching: true,
      shouldFallbackToInternal: true,
      stopLocationWatch,
      startInternalGpsWatch,
      activateWatchingState,
      markSourceUnavailable,
    });

    expect(stopLocationWatch).toHaveBeenCalledTimes(1);
    expect(startInternalGpsWatch).toHaveBeenCalledTimes(1);
    expect(activateWatchingState).not.toHaveBeenCalled();
    expect(markSourceUnavailable).toHaveBeenCalledTimes(1);
  });
});
