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
    );
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
