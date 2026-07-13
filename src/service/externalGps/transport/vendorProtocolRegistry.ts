/**
 * Recognizes known external GPS device vendors by the name Bluetooth reports for
 * them, so the source-selector UI can show a friendly label ("Bad Elf Flex") and so
 * discovery can filter out unrelated bonded devices (headphones, printers, etc).
 *
 * On iOS, MFi accessories additionally require their exact protocol string to be
 * declared in app.config.ts's `ios.infoPlist.UISupportedExternalAccessoryProtocols` -
 * that string must come from the vendor's own documentation or be read off the
 * device's `EAAccessory.protocolStrings` at runtime; it must never be guessed.
 * TODO: verify the Bad Elf protocol string against real hardware/Bad Elf's iOS SDK
 * docs before relying on it - "com.bad-elf.gps" below is unconfirmed.
 */
export type VendorRegistryEntry = {
  vendor: string;
  matchesName: (name: string) => boolean;
  iosProtocolString?: string;
};

const vendorRegistry: VendorRegistryEntry[] = [
  {
    vendor: "Bad Elf",
    matchesName: (name) => /bad\s*elf/i.test(name),
    iosProtocolString: "com.bad-elf.gps", // TODO: verify
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

export const recognizeVendor = (deviceName: string): string | undefined =>
  vendorRegistry.find((entry) => entry.matchesName(deviceName))?.vendor;

export const isRecognizedGpsDevice = (deviceName: string): boolean =>
  recognizeVendor(deviceName) !== undefined;
