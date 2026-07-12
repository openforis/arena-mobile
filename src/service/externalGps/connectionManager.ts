import { log } from "utils";
import { ExternalGpsConnection, ExternalGpsTransport } from "./types";

const idleGracePeriodMs = 60000;

type PoolEntry = {
  connectionPromise: Promise<ExternalGpsConnection>;
  listenerCount: number;
  idleTimeout: ReturnType<typeof setTimeout> | null;
};

const pool = new Map<string, PoolEntry>();

const clearIdleTimeout = (entry: PoolEntry) => {
  if (entry.idleTimeout) {
    clearTimeout(entry.idleTimeout);
    entry.idleTimeout = null;
  }
};

const closeEntry = async (sourceId: string, entry: PoolEntry) => {
  pool.delete(sourceId);
  try {
    const connection = await entry.connectionPromise;
    await connection.disconnect();
    log.debug("ExternalGps: closed idle connection to", sourceId);
  } catch (error) {
    log.warn("ExternalGps: error closing connection to", sourceId, error);
  }
};

/**
 * Ref-counted connection pool: Bluetooth Classic SPP/EA connect has real latency
 * (device wake-up, first-fix acquisition), and useLocationWatch's start/stop cycle
 * runs routinely (once per attribute capture), so the underlying connection is kept
 * open across repeated acquire/release calls until no listeners remain for
 * `idleGracePeriodMs`, rather than being torn down every time.
 */
const acquire = (
  sourceId: string,
  transport: ExternalGpsTransport,
): Promise<ExternalGpsConnection> => {
  let entry = pool.get(sourceId);
  if (!entry) {
    log.debug("ExternalGps: opening connection to", sourceId);
    entry = {
      connectionPromise: transport.connect(sourceId).catch((error) => {
        pool.delete(sourceId);
        throw error;
      }),
      listenerCount: 0,
      idleTimeout: null,
    };
    pool.set(sourceId, entry);
  }
  clearIdleTimeout(entry);
  entry.listenerCount += 1;
  return entry.connectionPromise;
};

const release = (sourceId: string) => {
  const entry = pool.get(sourceId);
  if (!entry) return;

  entry.listenerCount = Math.max(0, entry.listenerCount - 1);
  if (entry.listenerCount === 0) {
    entry.idleTimeout = setTimeout(
      () => closeEntry(sourceId, entry),
      idleGracePeriodMs,
    );
  }
};

/**
 * Closes every pooled connection immediately, bypassing the idle grace period.
 * Used when the app backgrounds or the user explicitly switches GPS source.
 */
const closeAll = async () => {
  const entries = Array.from(pool.entries());
  pool.clear();
  for (const [sourceId, entry] of entries) {
    clearIdleTimeout(entry);
    await closeEntry(sourceId, entry);
  }
};

export const ExternalGpsConnectionManager = {
  acquire,
  release,
  closeAll,
};
