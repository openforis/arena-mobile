import { createStreamStallMonitor } from "./streamStallMonitor";

describe("createStreamStallMonitor", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("reports a stall once per timeout while no data arrives", () => {
    const onStall = jest.fn();
    createStreamStallMonitor({ timeoutMs: 1000, onStall });

    jest.advanceTimersByTime(999);
    expect(onStall).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onStall).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(onStall).toHaveBeenCalledTimes(3);
  });

  it("does not report a stall while data keeps arriving", () => {
    const onStall = jest.fn();
    const monitor = createStreamStallMonitor({ timeoutMs: 1000, onStall });

    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(900);
      monitor.notifyData();
    }
    expect(onStall).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it("stops reporting once stopped", () => {
    const onStall = jest.fn();
    const monitor = createStreamStallMonitor({ timeoutMs: 1000, onStall });

    monitor.stop();
    monitor.notifyData();
    jest.advanceTimersByTime(5000);

    expect(onStall).not.toHaveBeenCalled();
  });
});
