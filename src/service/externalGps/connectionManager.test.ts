import { ExternalGpsConnectionManager } from "./connectionManager";
import { ExternalGpsConnection, ExternalGpsTransport } from "./types";

jest.mock("../../utils", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const sourceId = "external:test";

const createConnection = (): ExternalGpsConnection => ({
  onData: jest.fn(() => ({ remove: jest.fn() })),
  onDisconnected: jest.fn(() => ({ remove: jest.fn() })),
  disconnect: jest.fn().mockResolvedValue(undefined),
});

const createTransport = (connections: ExternalGpsConnection[]) => {
  const connect = jest.fn();
  for (const connection of connections)
    connect.mockResolvedValueOnce(connection);
  return {
    connect,
    isConnected: jest.fn().mockResolvedValue(true),
  } as unknown as ExternalGpsTransport;
};

describe("ExternalGpsConnectionManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await ExternalGpsConnectionManager.closeAll();
    jest.useRealTimers();
  });

  it("keeps a released connection for the next acquire", async () => {
    const connection = createConnection();
    const transport = createTransport([connection]);

    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    ExternalGpsConnectionManager.release(sourceId);
    const reacquired = await ExternalGpsConnectionManager.acquire(
      sourceId,
      transport,
    );

    expect(reacquired).toBe(connection);
    expect(transport.connect).toHaveBeenCalledTimes(1);
    expect(connection.disconnect).not.toHaveBeenCalled();
  });

  it("closes a released connection right away when discarded", async () => {
    const first = createConnection();
    const second = createConnection();
    const transport = createTransport([first, second]);

    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    ExternalGpsConnectionManager.release(sourceId, { discard: true });
    await jest.advanceTimersByTimeAsync(0);
    expect(first.disconnect).toHaveBeenCalledTimes(1);

    const reacquired = await ExternalGpsConnectionManager.acquire(
      sourceId,
      transport,
    );
    expect(reacquired).toBe(second);
  });

  it("does not discard a connection still used by another caller", async () => {
    const connection = createConnection();
    const transport = createTransport([connection]);

    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    ExternalGpsConnectionManager.release(sourceId, { discard: true });
    await jest.advanceTimersByTimeAsync(0);

    expect(connection.disconnect).not.toHaveBeenCalled();
  });

  it("replaces a stale connection with a fresh one", async () => {
    const stale = createConnection();
    const fresh = createConnection();
    const transport = createTransport([stale, fresh]);

    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    const replacementPromise = ExternalGpsConnectionManager.replace(
      sourceId,
      transport,
      stale,
    );
    await jest.advanceTimersByTimeAsync(1000);

    expect(await replacementPromise).toBe(fresh);
    expect(stale.disconnect).toHaveBeenCalledTimes(1);
  });

  it("hands out the current connection when the stale one was already replaced", async () => {
    const stale = createConnection();
    const fresh = createConnection();
    const transport = createTransport([stale, fresh]);

    await ExternalGpsConnectionManager.acquire(sourceId, transport);
    const firstReplacement = ExternalGpsConnectionManager.replace(
      sourceId,
      transport,
      stale,
    );
    await jest.advanceTimersByTimeAsync(1000);
    await firstReplacement;

    const secondReplacement = await ExternalGpsConnectionManager.replace(
      sourceId,
      transport,
      stale,
    );

    expect(secondReplacement).toBe(fresh);
    expect(transport.connect).toHaveBeenCalledTimes(2);
    expect(fresh.disconnect).not.toHaveBeenCalled();
  });
});
