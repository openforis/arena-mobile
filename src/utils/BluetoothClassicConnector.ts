import RNBluetoothClassic, {
  BluetoothDevice as ClassicDevice,
  StandardOptions as ClassicConnectionOptions,
} from "react-native-bluetooth-classic";

import { Permissions } from "./Permissions";

class BluetoothClassicConnector {
  private connectedClassicDeviceId: string | null = null;

  public async connect({
    deviceId,
    options,
  }: {
    deviceId: string;
    options?: ClassicConnectionOptions;
  }): Promise<ClassicDevice> {
    const permissionGranted = await Permissions.requestBluetoothPermissions();
    if (!permissionGranted) {
      throw new Error("Bluetooth permissions not granted");
    }

    const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!isEnabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }

    const connectedDevice = await RNBluetoothClassic.connectToDevice(
      deviceId,
      options,
    );
    this.connectedClassicDeviceId = connectedDevice.id;
    return connectedDevice;
  }

  public async disconnect(deviceId?: string): Promise<boolean> {
    const resolvedDeviceId = deviceId ?? this.connectedClassicDeviceId;
    if (!resolvedDeviceId) return false;

    const disconnected =
      await RNBluetoothClassic.disconnectFromDevice(resolvedDeviceId);
    if (disconnected && resolvedDeviceId === this.connectedClassicDeviceId) {
      this.connectedClassicDeviceId = null;
    }
    return disconnected;
  }
}

export const bluetoothClassicConnector = new BluetoothClassicConnector();
