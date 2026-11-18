import { createTimeSlicer } from "./GeoTiffImages";

describe("createTimeSlicer", () => {
  it("yields to the event loop only after the busy time", async () => {
    let now = 1000;
    const dateNow = jest.spyOn(Date, "now").mockImplementation(() => now);
    const timeouts = jest.spyOn(globalThis, "setTimeout");
    const yieldIfBusy = createTimeSlicer(50);
    now += 20;
    await yieldIfBusy();
    expect(timeouts).not.toHaveBeenCalled();
    now += 40;
    await yieldIfBusy();
    expect(timeouts).toHaveBeenCalledTimes(1);
    now += 10;
    await yieldIfBusy();
    expect(timeouts).toHaveBeenCalledTimes(1);
    dateNow.mockRestore();
    timeouts.mockRestore();
  });
});
