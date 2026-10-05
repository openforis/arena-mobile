import { log } from "../../../utils";
import { containsNmeaSentence, startSessionInit } from "./sessionInit";

jest.mock("../../../utils", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("startSessionInit", () => {
  const packetHex = "24be";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not write before the session has had time to open", () => {
    const write = jest.fn().mockResolvedValue(true);

    startSessionInit({ deviceLabel: "Bad Elf", packetHex, write });

    expect(write).not.toHaveBeenCalled();
  });

  it("re-sends the packet until stopped", async () => {
    const write = jest.fn().mockResolvedValue(true);

    const sessionInit = startSessionInit({
      deviceLabel: "Bad Elf",
      packetHex,
      write,
    });

    await jest.advanceTimersByTimeAsync(1000);
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith(packetHex);

    await jest.advanceTimersByTimeAsync(3000);
    expect(write).toHaveBeenCalledTimes(2);

    sessionInit.stop();

    await jest.advanceTimersByTimeAsync(60000);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it("keeps retrying after a failed write, then gives up with a warning", async () => {
    const write = jest.fn().mockRejectedValue(new Error("not connected"));

    startSessionInit({ deviceLabel: "Bad Elf", packetHex, write });

    await jest.advanceTimersByTimeAsync(60000);

    expect(write).toHaveBeenCalledTimes(5);
    expect(log.warn).toHaveBeenLastCalledWith(
      expect.stringContaining("no NMEA data received from Bad Elf"),
    );
  });
});

describe("containsNmeaSentence", () => {
  it("recognizes standard and proprietary NMEA sentences", () => {
    expect(
      containsNmeaSentence(
        "$GPGGA,011449.00,3337.45759,N,11154.86471,W,1,03,6.70,445.3,M,-27.5,M,,*6C\r",
      ),
    ).toBe(true);
    expect(containsNmeaSentence("$PELFID,Bad Elf,1.0*00\r")).toBe(true);
  });

  it("ignores Bad Elf binary handshake packets", () => {
    // replies of a Bad Elf GNSS Surveyor to the legacy session init packet
    expect(containsNmeaSentence("$\u00be\u0000\u0011\u0001\u0001\u0001")).toBe(
      false,
    );
    expect(
      containsNmeaSentence(
        "$\u00be\u0000\u0013\u0002\u0002\u0003\u0004!\u0000B\u0000\u0001C\u0007{\u00d7\r",
      ),
    ).toBe(false);
  });
});
