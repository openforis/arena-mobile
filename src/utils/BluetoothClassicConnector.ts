import RNBluetoothClassic, {
  BluetoothEventSubscription,
  BluetoothDevice as ClassicDevice,
  StandardOptions as ClassicConnectionOptions,
} from "react-native-bluetooth-classic";

import { Permissions } from "./Permissions";
import { log } from "./Logger";

class BluetoothClassicConnector {
  private connectedDeviceId: string | null = null;
  private dataSubscription: BluetoothEventSubscription | null = null;

  private clearDataSubscription() {
    this.dataSubscription?.remove();
    this.dataSubscription = null;
  }

  public async connect({
    deviceId,
    options,
    onRawData,
  }: {
    deviceId: string;
    options?: ClassicConnectionOptions;
    onRawData?: (raw: string) => void;
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

    this.clearDataSubscription();
    if (onRawData) {
      this.dataSubscription = connectedDevice.onDataReceived(({ data }) => {
        onRawData(data);
      });
    }

    this.connectedDeviceId = connectedDevice.id;
    return connectedDevice;
  }

  public async disconnect(deviceId?: string): Promise<boolean> {
    log.debug(
      `BluetoothClassicConnector: disconnect called with deviceId=${deviceId}`,
    );
    this.clearDataSubscription();

    const resolvedDeviceId = deviceId ?? this.connectedDeviceId;
    if (!resolvedDeviceId) return false;

    const disconnected =
      await RNBluetoothClassic.disconnectFromDevice(resolvedDeviceId);
    if (disconnected && resolvedDeviceId === this.connectedDeviceId) {
      this.connectedDeviceId = null;
    }
    return disconnected;
  }
}

export const bluetoothClassicConnector = new BluetoothClassicConnector();
