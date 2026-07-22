import { mergeDiscoveredDevice } from "./gpsDeviceDiscoveryUtils";

describe("mergeDiscoveredDevice", () => {
  it("appends a new device", () => {
    const result = mergeDiscoveredDevice(
      [],
      { address: "00:11:22", name: "Bad Elf Flex", vendor: "Bad Elf" },
    );
    expect(result).toEqual([
      { address: "00:11:22", name: "Bad Elf Flex", vendor: "Bad Elf" },
    ]);
  });

  it("replaces an existing device with the same address instead of duplicating it", () => {
    const existing = [
      { address: "00:11:22", name: "Bad Elf Flex", vendor: "Bad Elf" },
    ];
    const result = mergeDiscoveredDevice(existing, {
      address: "00:11:22",
      name: "Bad Elf Flex (updated)",
      vendor: "Bad Elf",
    });
    expect(result).toEqual([
      { address: "00:11:22", name: "Bad Elf Flex (updated)", vendor: "Bad Elf" },
    ]);
  });

  it("keeps recognized-vendor devices ahead of unrecognized ones", () => {
    const existing = [{ address: "aa:aa:aa", name: "Headphones" }];
    const result = mergeDiscoveredDevice(existing, {
      address: "bb:bb:bb",
      name: "Bad Elf Flex",
      vendor: "Bad Elf",
    });
    expect(result).toEqual([
      { address: "bb:bb:bb", name: "Bad Elf Flex", vendor: "Bad Elf" },
      { address: "aa:aa:aa", name: "Headphones" },
    ]);
  });
});
