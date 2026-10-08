import { Promises } from "@openforis/arena-core";

import { log } from "utils";
import { ExternalGpsConnection, ExternalGpsTransport } from "./types";

const idleGracePeriodMs = 60000;
// pause between closing a connection and opening its replacement
const reconnectDelayMs = 500;

type PoolEntry = {
  connectionPromise: Promise<ExternalGpsConnection>;
  connection: ExternalGpsConnection | null; // set once connectionPromise resolves
  listenerCount: number;
  idleTimeout: ReturnType<typeof setTimeout> | null;
  disconnectSubscription: { remove: () => void } | null;
};

const pool = new Map<string, PoolEntry>();

const clearIdleTimeout = (entry: PoolEntry) => {
  if (entry.idleTimeout) {
    clearTimeout(entry.idleTimeout);
    entry.idleTimeout = null;
  }
};

const closeEntry = async (sourceId: string, entry: PoolEntry) => {
  if (pool.get(sourceId) === entry) pool.delete(sourceId);
  entry.disconnectSubscription?.remove();
  try {
    const connection = await entry.connectionPromise;
    await connection.disconnect();
    log.debug("ExternalGps: closed connection to", sourceId);
  } catch (error) {
    log.warn("ExternalGps: error closing connection to", sourceId, error);
  }
};

/**
 * Opens a fresh connection and wires it to invalidate its own pool entry the moment
 * the device reports a disconnect/error, so a socket that has gone dead (e.g. the
 * external device was switched off) is never handed back out by a later acquire().
 */
const openConnection = (
  sourceId: string,
  transport: ExternalGpsTransport,
): PoolEntry => {
  log.debug("ExternalGps: opening connection to", sourceId);
  const entry: PoolEntry = {
    connectionPromise: transport.connect(sourceId).catch((error) => {
      if (pool.get(sourceId) === entry) pool.delete(sourceId);
      throw error;
    }),
    connection: null,
    listenerCount: 0,
    idleTimeout: null,
    disconnectSubscription: null,
  };
  entry.connectionPromise.then(
    (connection) => {
      entry.connection = connection;
      // Entry may already have been replaced/removed (e.g. connect() was slow and
      // the caller gave up) - don't attach to a connection nobody references anymore.
      if (pool.get(sourceId) !== entry) return;
      entry.disconnectSubscription = connection.onDisconnected(() => {
        if (pool.get(sourceId) !== entry) return;
        log.warn("ExternalGps: device disconnected unexpectedly", sourceId);
        clearIdleTimeout(entry);
        pool.delete(sourceId);
      });
    },
    () => {}, // connect failure is already surfaced via connectionPromise rejection
  );
  pool.set(sourceId, entry);
  return entry;
};

/**
 * Ref-counted connection pool: Bluetooth Classic SPP/EA connect has real latency
 * (device wake-up, first-fix acquisition), and useLocationWatch's start/stop cycle
 * runs routinely (once per attribute capture), so the underlying connection is kept
 * open across repeated acquire/release calls until no listeners remain for
 * `idleGracePeriodMs`, rather than being torn down every time.
 *
 * Reuse is only safe if the pooled connection is still alive: the external device can
 * be switched off between captures without the app knowing yet (see openConnection's
 * disconnect listener), so liveness is re-checked here as a second safety net before
 * a pooled connection is ever handed back out.
 */
const acquire = async (
  sourceId: string,
  transport: ExternalGpsTransport,
): Promise<ExternalGpsConnection> => {
  const existing = pool.get(sourceId);
  if (existing) {
    clearIdleTimeout(existing);
    const alive = await transport.isConnected(sourceId).catch(() => false);
    if (alive) {
      log.debug("ExternalGps: reusing pooled connection to", sourceId);
      existing.listenerCount += 1;
      return existing.connectionPromise;
    }
    log.warn(
      "ExternalGps: pooled connection to",
      sourceId,
      "is no longer alive, reconnecting",
    );
    await closeEntry(sourceId, existing);
  }

  const entry = openConnection(sourceId, transport);
  entry.listenerCount += 1;
  return entry.connectionPromise;
};

/**
 * `discard`: the caller found the connection silent (connected, but no data coming
 * through). Such a connection doesn't recover by being kept open, so once nobody else
 * is using it, it's closed right away rather than kept for the next acquire().
 */
const release = (
  sourceId: string,
  { discard = false }: { discard?: boolean } = {},
) => {
  const entry = pool.get(sourceId);
  if (!entry) return;

  entry.listenerCount = Math.max(0, entry.listenerCount - 1);
  if (entry.listenerCount > 0) return;

  if (discard) {
    log.info("ExternalGps: discarding silent connection to", sourceId);
    void closeEntry(sourceId, entry);
    return;
  }
  entry.idleTimeout = setTimeout(
    () => closeEntry(sourceId, entry),
    idleGracePeriodMs,
  );
};

/**
 * Swaps a connection that has gone silent for a fresh one, on behalf of a caller that
 * is still using it: closes `staleConnection` (unless another caller already replaced
 * it) and acquires the current one. The caller's hold on the stale connection is
 * dropped with it, so this counts as its new acquire().
 */
const replace = async (
  sourceId: string,
  transport: ExternalGpsTransport,
  staleConnection: ExternalGpsConnection,
): Promise<ExternalGpsConnection> => {
  const existing = pool.get(sourceId);
  if (existing?.connection === staleConnection) {
    clearIdleTimeout(existing);
    await closeEntry(sourceId, existing);
    await new Promise((resolve) => setTimeout(resolve, reconnectDelayMs));
  }
  return acquire(sourceId, transport);
};

/**
 * Closes every pooled connection immediately, bypassing the idle grace period.
 * Used when the app backgrounds or the user explicitly switches GPS source.
 */
const closeAll = async () => {
  const entries = Array.from(pool.entries());
  pool.clear();
  await Promises.each(entries, async ([sourceId, entry]) => {
    clearIdleTimeout(entry);
    await closeEntry(sourceId, entry);
  });
};

export const ExternalGpsConnectionManager = {
  acquire,
  release,
  replace,
  closeAll,
};
