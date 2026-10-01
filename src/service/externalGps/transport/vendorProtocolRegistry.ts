/**
 * Recognizes known external GPS device vendors by the name Bluetooth reports for
 * them, so the source-selector UI can show a friendly label ("Bad Elf Flex") and so
 * discovery can filter out unrelated bonded devices (headphones, printers, etc). Also
 * used to categorize (not filter - see bluetoothClassicTransport.startDiscovery) live
 * on-demand pairing scan results, since a device's advertised name is the same before
 * and after bonding.
 *
 * On iOS, MFi accessories additionally require their exact protocol string to be
 * declared in app.config.ts's `ios.infoPlist.UISupportedExternalAccessoryProtocols` -
 * that string must come from the vendor's own documentation or be read off the
 * device's `EAAccessory.protocolStrings` at runtime; it must never be guessed.
 */
export type VendorRegistryEntry = {
  vendor: string;
  matchesName: (name: string) => boolean;
  iosProtocolString?: string;
  // Hex-encoded packet the accessory needs to receive over the EASession before it
  // starts streaming NMEA (iOS only - not needed over Android's plain SPP socket).
  iosSessionInitPacketHex?: string;
  // Vendor-documented meters-per-HDOP-unit factor for estimating horizontal accuracy
  // when the receiver doesn't emit $--GST; overrides the generic estimate in
  // nmeaToLocationPoint.
  hdopAccuracyFactorMeters?: number;
};

const vendorRegistry: VendorRegistryEntry[] = [
  {
    vendor: "Bad Elf",
    matchesName: (name) => /bad\s*elf/i.test(name),
    iosProtocolString: "com.bad-elf.gps",
    // Enables GGA + RMC output on the legacy "com.bad-elf.gps" protocol; without it the
    // accessory stays silent after the session opens. Value taken verbatim from Bad
    // Elf's iOS integration guide (github.com/BadElf/gps-sdk/wiki).
    iosSessionInitPacketHex:
      "24be001105010205310132043301640d0a24be000a0100080b0d0a",
    // Same guide: HDOP * 3.9 m matches the accuracy shown on the receiver's LCD and
    // in Bad Elf's own app.
    hdopAccuracyFactorMeters: 3.9,
  },
  {
    vendor: "Garmin GLO",
    // Covers both the original GLO ("Glo") and the GLO 2 ("Glo2", no space); accept an
    // optional space/dash between "glo" and "2" in case other firmware revisions differ.
    matchesName: (name) => /\bglo[\s-]*2?\b/i.test(name),
    // iosProtocolString intentionally omitted: no confirmed value from Garmin's docs or
    // a real device's EAAccessory.protocolStrings yet - do not guess (see file header).
  },
  {
    vendor: "Eos Arrow",
    // Eos receivers (Arrow Gold/100/200/Lite) report names like "Arrow Gold-XXXXX" or
    // "Arrow 100 - XXXXX". Unconfirmed against real hardware - adjust if a device isn't
    // recognized (see the debug log of bonded device names in bluetoothClassicTransport).
    matchesName: (name) => /\barrow\b/i.test(name),
  },
  {
    vendor: "Trimble",
    // Trimble receivers (R1, R2, Catalyst, DA1/DA2) report names like "Trimble R2-XXXXXX".
    // Unconfirmed against real hardware.
    matchesName: (name) => /\btrimble\b/i.test(name),
  },
  {
    vendor: "Geneq SXBlue",
    // Geneq SXBlue receivers report names like "SXBlueII-XXXX" or "SXBlue3-XXXX".
    // Unconfirmed against real hardware.
    matchesName: (name) => /sx\s*blue/i.test(name),
  },
  {
    vendor: "Dual XGPS",
    // Dual Electronics receivers (XGPS150, XGPS160) report names like "XGPS150-BTXXXX" or
    // "DUAL XGPS150A - XXXX". Unconfirmed against real hardware.
    matchesName: (name) => /\bx\s*gps\s*1[56]0\b/i.test(name),
  },
];

const findVendorEntry = (deviceName: string): VendorRegistryEntry | undefined =>
  vendorRegistry.find((entry) => entry.matchesName(deviceName));

export const recognizeVendor = (deviceName: string): string | undefined =>
  findVendorEntry(deviceName)?.vendor;

export const getIosSessionInitPacketHex = (
  deviceName: string,
): string | undefined => findVendorEntry(deviceName)?.iosSessionInitPacketHex;

export const getHdopAccuracyFactorMeters = (
  deviceName: string,
): number | undefined => findVendorEntry(deviceName)?.hdopAccuracyFactorMeters;

export const isRecognizedGpsDevice = (deviceName: string): boolean =>
  recognizeVendor(deviceName) !== undefined;
