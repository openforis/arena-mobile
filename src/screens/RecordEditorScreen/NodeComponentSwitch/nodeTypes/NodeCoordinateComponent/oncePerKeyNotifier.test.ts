import { createOncePerKeyNotifier } from "./oncePerKeyNotifier";

describe("createOncePerKeyNotifier", () => {
  test("notifies only once per key", () => {
    const notifier = createOncePerKeyNotifier();
    expect(notifier.shouldNotify("EPSG:4326")).toBe(true);
    expect(notifier.shouldNotify("EPSG:4326")).toBe(false);
    expect(notifier.shouldNotify("EPSG:32633")).toBe(true);
    expect(notifier.shouldNotify("EPSG:32633")).toBe(false);
  });

  test("notifies again after reset", () => {
    const notifier = createOncePerKeyNotifier();
    expect(notifier.shouldNotify("EPSG:4326")).toBe(true);
    notifier.reset();
    expect(notifier.shouldNotify("EPSG:4326")).toBe(true);
  });
});
