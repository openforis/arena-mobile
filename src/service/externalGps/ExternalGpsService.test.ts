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
  },
}));

describe("ExternalGpsService.watchPosition", () => {
  it("forwards disconnects and removes both subscriptions when stopped", async () => {
    const dataRemove = jest.fn();
    const disconnectRemove = jest.fn();
    let onDataListener: ((chunk: string) => void) | null = null;
    let onDisconnectedListener: (() => void) | null = null;

    const connection = {
      onData: jest.fn((listener: (chunk: string) => void) => {
        onDataListener = listener;
        return { remove: dataRemove };
      }),
      onDisconnected: jest.fn((listener: () => void) => {
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

    onDataListener?.("$GPGGA,example");
    expect(assembler.ingest).toHaveBeenCalledWith("$GPGGA,example");
    expect(locationCallback).toHaveBeenCalledWith({
      latitude: 40,
      longitude: -74,
      accuracy: 5,
    });

    onDisconnectedListener?.();
    expect(disconnectedCallback).toHaveBeenCalledTimes(1);

    subscription.remove();
    expect(dataRemove).toHaveBeenCalledTimes(1);
    expect(disconnectRemove).toHaveBeenCalledTimes(1);
    expect(ExternalGpsConnectionManager.release).toHaveBeenCalledWith(
      "external:test",
    );
  });
});
