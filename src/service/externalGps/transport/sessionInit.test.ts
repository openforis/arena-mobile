import { log } from "../../../utils";
import { startSessionInit } from "./sessionInit";

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
      expect.stringContaining("no data received from Bad Elf"),
    );
  });
});
