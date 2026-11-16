import { recognizeVendor } from "./vendorProtocolRegistry";

describe("recognizeVendor", () => {
  it.each([
    ["Bad Elf GPS Pro+", "Bad Elf"],
    ["Glo2", "Garmin GLO"],
    ["Geode 123456", "Juniper Geode"],
    ["GEODE 654321", "Juniper Geode"],
  ])("recognizes %s as %s", (name, vendor) => {
    expect(recognizeVendor(name)).toBe(vendor);
  });

  it.each(["JBL Flip 5", "Geodesic Printer", ""])(
    "does not recognize %s",
    (name) => {
      expect(recognizeVendor(name)).toBeUndefined();
    },
  );
});
