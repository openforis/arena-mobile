import { log } from "utils";

const firstAttemptDelayMs = 1000;
const retryIntervalMs = 3000;
const maxAttempts = 5;

/**
 * Sends the vendor's session init packet (see vendorProtocolRegistry's
 * `iosSessionInitPacketHex`) so the accessory starts streaming NMEA, re-sending it
 * every `retryIntervalMs` until the caller calls stop() (i.e. data started flowing, or
 * the connection was closed) or `maxAttempts` is reached.
 *
 * Both the initial delay and the retries are needed because the native write isn't
 * reliable right after connecting: connectToDevice() resolves before the EASession
 * output stream has finished opening, and bytes written before that are silently
 * dropped rather than queued.
 */
export const startSessionInit = ({
  deviceLabel,
  packetHex,
  write,
}: {
  deviceLabel: string;
  packetHex: string;
  write: (packetHex: string) => Promise<unknown>;
}): { stop: () => void } => {
  let attempts = 0;
  let stopped = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const send = async () => {
    timeout = null;
    attempts += 1;
    log.debug(
      `ExternalGps: sending session init packet to ${deviceLabel} (attempt ${attempts}/${maxAttempts})`,
    );
    try {
      const written = await write(packetHex);
      log.debug(
        `ExternalGps: session init packet write to ${deviceLabel} returned ${written}`,
      );
    } catch (error) {
      log.warn(
        "ExternalGps: failed to send session init packet to",
        deviceLabel,
        error,
      );
    }
    if (stopped) return;
    if (attempts >= maxAttempts) {
      log.warn(
        `ExternalGps: no data received from ${deviceLabel} after ${maxAttempts} session init attempts`,
      );
      return;
    }
    timeout = setTimeout(send, retryIntervalMs);
  };

  timeout = setTimeout(send, firstAttemptDelayMs);

  return {
    stop: () => {
      stopped = true;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    },
  };
};
