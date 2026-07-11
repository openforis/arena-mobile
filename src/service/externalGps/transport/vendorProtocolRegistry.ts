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
];

export const recognizeVendor = (deviceName: string): string | undefined =>
  vendorRegistry.find((entry) => entry.matchesName(deviceName))?.vendor;

export const isRecognizedGpsDevice = (deviceName: string): boolean =>
  recognizeVendor(deviceName) !== undefined;
