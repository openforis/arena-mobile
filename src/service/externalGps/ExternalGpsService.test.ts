import { ExternalGpsService } from "./ExternalGpsService";
import { ExternalGpsConnectionManager } from "./connectionManager";
import { createNmeaLocationPointAssembler } from "./nmea/nmeaToLocationPoint";
import { bluetoothClassicTransport } from "./transport/bluetoothClassicTransport";

jest.mock("../../utils", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("../../model", () => ({
  GpsSourceSetting: {
    internal: "internal",
  },
}));

jest.mock("./connectionManager", () => ({
  ExternalGpsConnectionManager: {
    acquire: jest.fn(),
    release: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("./nmea/nmeaToLocationPoint", () => ({
  createNmeaLocationPointAssembler: jest.fn(),
}));

jest.mock("./transport/bluetoothClassicTransport", () => ({
  bluetoothClassicTransport: {
    listSources: jest.fn(),
    isBluetoothEnabled: jest.fn(),
    requestBluetoothEnabled: jest.fn(),
    startDiscovery: jest.fn(),
    pairDevice: jest.fn(),
  },
}));

describe("ExternalGpsService.watchPosition", () => {
  it("forwards disconnects and removes both subscriptions when stopped", async () => {
    const dataRemove = jest.fn();
    const disconnectRemove = jest.fn();
    type ChunkCallback = (chunk: string) => void;
    type VoidFn = () => void;
    let onDataListener: ChunkCallback | null = null;
    let onDisconnectedListener: VoidFn | null = null;

    const connection = {
      onData: jest.fn((listener: ChunkCallback) => {
        onDataListener = listener;
        return { remove: dataRemove };
      }),
      onDisconnected: jest.fn((listener: VoidFn) => {
        onDisconnectedListener = listener;
        return { remove: disconnectRemove };
      }),
      disconnect: jest.fn(),
    };

    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      connection,
    );

    const assembler = {
      ingest: jest.fn().mockReturnValue({
        latitude: 40,
        longitude: -74,
        accuracy: 5,
      }),
    };
    (createNmeaLocationPointAssembler as jest.Mock).mockReturnValue(assembler);

    const locationCallback = jest.fn();
    const disconnectedCallback = jest.fn();

    const subscription = await ExternalGpsService.watchPosition(
      { sourceId: "external:test" },
      locationCallback,
      { onDisconnected: disconnectedCallback },
    );

    expect(ExternalGpsConnectionManager.acquire).toHaveBeenCalledWith(
      "external:test",
      bluetoothClassicTransport,
    );
    expect(connection.onData).toHaveBeenCalledTimes(1);
    expect(connection.onDisconnected).toHaveBeenCalledTimes(1);

    if (onDataListener) {
      (onDataListener as ChunkCallback)("$GPGGA,example");
    }
    expect(assembler.ingest).toHaveBeenCalledWith("$GPGGA,example");
    expect(locationCallback).toHaveBeenCalledWith({
      latitude: 40,
      longitude: -74,
      accuracy: 5,
    });

    if (onDisconnectedListener) {
      (onDisconnectedListener as VoidFn)();
    }
    expect(disconnectedCallback).toHaveBeenCalledTimes(1);

    subscription.remove();
    expect(dataRemove).toHaveBeenCalledTimes(1);
    expect(disconnectRemove).toHaveBeenCalledTimes(1);
    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledWith(
      "external:test",
      { discard: false },
    );
  });
});

describe("ExternalGpsService.watchPosition silent stream recovery", () => {
  type ChunkCallback = (chunk: string) => void;
  const sourceId = "external:test";

  const createConnection = ({ withSessionInit = true } = {}) => {
    const state = { dataListener: null as ChunkCallback | null };
    const dataRemove = jest.fn();
    return {
      emitData: (chunk: string) => state.dataListener?.(chunk),
      dataRemove,
      onData: jest.fn((listener: ChunkCallback) => {
        state.dataListener = listener;
        return { remove: dataRemove };
      }),
      onDisconnected: jest.fn(() => ({ remove: jest.fn() })),
      restartSessionInit: withSessionInit ? jest.fn() : undefined,
      disconnect: jest.fn(),
    };
  };

  const watch = (listeners?: { onDisconnected?: () => void }) =>
    ExternalGpsService.watchPosition({ sourceId }, jest.fn(), listeners);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (createNmeaLocationPointAssembler as jest.Mock).mockReturnValue({
      ingest: jest.fn().mockReturnValue(null),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sends the session init again, then replaces the connection, while silent", async () => {
    const stale = createConnection();
    const fresh = createConnection();
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      stale,
    );
    (ExternalGpsConnectionManager.replace as jest.Mock).mockResolvedValue(
      fresh,
    );

    const subscription = await watch();

    await jest.advanceTimersByTimeAsync(8000);
    expect(stale.restartSessionInit).toHaveBeenCalledTimes(1);
    expect(ExternalGpsConnectionManager.replace).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(8000);
    expect(ExternalGpsConnectionManager.replace).toHaveBeenCalledWith(
      sourceId,
      bluetoothClassicTransport,
      stale,
    );
    expect(stale.dataRemove).toHaveBeenCalledTimes(1);
    expect(fresh.onData).toHaveBeenCalledTimes(1);

    subscription.remove();
  });

  it("replaces the connection directly when the device has no session init", async () => {
    const stale = createConnection({ withSessionInit: false });
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      stale,
    );
    (ExternalGpsConnectionManager.replace as jest.Mock).mockResolvedValue(
      createConnection({ withSessionInit: false }),
    );

    const subscription = await watch();
    await jest.advanceTimersByTimeAsync(8000);

    expect(ExternalGpsConnectionManager.replace).toHaveBeenCalledTimes(1);

    subscription.remove();
  });

  it("leaves the connection alone while data keeps arriving", async () => {
    const connection = createConnection();
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      connection,
    );

    const subscription = await watch();
    for (let i = 0; i < 10; i++) {
      await jest.advanceTimersByTimeAsync(5000);
      connection.emitData("$GPGGA,example");
    }

    expect(connection.restartSessionInit).not.toHaveBeenCalled();
    expect(ExternalGpsConnectionManager.replace).not.toHaveBeenCalled();

    subscription.remove();
    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledWith(
      sourceId,
      { discard: false },
    );
  });

  it("stops replacing the connection after the maximum number of attempts", async () => {
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      createConnection(),
    );
    (ExternalGpsConnectionManager.replace as jest.Mock).mockImplementation(
      async () => createConnection(),
    );

    const subscription = await watch();
    await jest.advanceTimersByTimeAsync(180000);

    expect(ExternalGpsConnectionManager.replace).toHaveBeenCalledTimes(3);

    subscription.remove();
  });

  it("discards the connection when the watch ends with a silent stream", async () => {
    const connection = createConnection();
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      connection,
    );

    const subscription = await watch();
    connection.emitData("$GPGGA,example");
    await jest.advanceTimersByTimeAsync(7000);
    connection.emitData("$GPGGA,example");
    await jest.advanceTimersByTimeAsync(9000);
    subscription.remove();

    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledWith(
      sourceId,
      { discard: true },
    );
  });

  it("reports a disconnect when the connection cannot be replaced", async () => {
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      createConnection({ withSessionInit: false }),
    );
    (ExternalGpsConnectionManager.replace as jest.Mock).mockRejectedValue(
      new Error("connect failed"),
    );
    const onDisconnected = jest.fn();

    const subscription = await watch({ onDisconnected });
    await jest.advanceTimersByTimeAsync(8000);

    expect(onDisconnected).toHaveBeenCalledTimes(1);

    subscription.remove();
    expect(ExternalGpsConnectionManager.release).not.toHaveBeenCalled();
  });

  it("releases the replacement connection when the watch ended meanwhile", async () => {
    (ExternalGpsConnectionManager.acquire as jest.Mock).mockResolvedValue(
      createConnection({ withSessionInit: false }),
    );
    let resolveReplace: (connection: unknown) => void = () => {};
    (ExternalGpsConnectionManager.replace as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveReplace = resolve;
      }),
    );

    const subscription = await watch();
    await jest.advanceTimersByTimeAsync(8000);
    subscription.remove();
    expect(ExternalGpsConnectionManager.release).not.toHaveBeenCalled();

    const fresh = createConnection({ withSessionInit: false });
    resolveReplace(fresh);
    await jest.advanceTimersByTimeAsync(0);

    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledTimes(1);
    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledWith(sourceId);
    expect(fresh.onData).not.toHaveBeenCalled();
  });
});

describe("ExternalGpsService discovery/pairing delegation", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("startGpsDeviceDiscovery delegates to the transport with both callbacks", async () => {
    const stopHandle = { stop: jest.fn() };
    (bluetoothClassicTransport.startDiscovery as jest.Mock).mockResolvedValue(
      stopHandle,
    );

    const onDeviceDiscovered = jest.fn();
    const onFinished = jest.fn();

    const result = await ExternalGpsService.startGpsDeviceDiscovery(
      onDeviceDiscovered,
      onFinished,
    );

    expect(bluetoothClassicTransport.startDiscovery).toHaveBeenCalledWith(
      onDeviceDiscovered,
      onFinished,
    );
    expect(result).toBe(stopHandle);
  });

  it("pairGpsDevice delegates to the transport", async () => {
    const source = {
      id: "external:00:11:22",
      type: "external",
      label: "Bad Elf",
    };
    (bluetoothClassicTransport.pairDevice as jest.Mock).mockResolvedValue(
      source,
    );

    const result = await ExternalGpsService.pairGpsDevice("00:11:22");

    expect(bluetoothClassicTransport.pairDevice).toHaveBeenCalledWith(
      "00:11:22",
    );
    expect(result).toBe(source);
  });
});
