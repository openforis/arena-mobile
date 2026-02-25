import { useBLE } from "./useBLE";

const serviceUUID = "9e000000-f685-4ea5-b58a-85287cb04965";
const characteristicUUID = "9e010000-f685-4ea5-b58a-85287cb04965";

type VertexLaserGeoData = {
  horizontalDistanceM: number;
  horizontalAngleDeg: number;
  distanceM: number;
  heightM: number;
  verticalAngleDeg: number;
};

export const useVertexLaserGeoDevice = ({
  onData,
}: {
  onData: (data: VertexLaserGeoData) => void;
}) => {
  const { connectBle, disconnectBle, bleError, isBleConnected } = useBLE<any>({
    onRawData: (raw) => {
      const parts = raw.split("\t");
      const horizontalDistanceM = parseFloat(parts[0]!) / 10;
      const distanceM = parseFloat(parts[1]!) / 10;
      const heightM = parseFloat(parts[2]!) / 10;
      const verticalAngleDeg = parseFloat(parts[3]!) / 10;
      const horizontalAngleDeg = parseFloat(parts[4]!) / 10;

      onData({
        horizontalDistanceM,
        horizontalAngleDeg,
        distanceM,
        heightM,
        verticalAngleDeg,
      });
    },
  });

  const connect = async ({ deviceId }: { deviceId: string }) => {
    await connectBle({ deviceId, serviceUUID, characteristicUUID });
  };

  return {
    connect,
    disconnect: disconnectBle,
    bleError,
    isBleConnected,
  };
};
