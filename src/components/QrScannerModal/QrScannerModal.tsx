import { useCallback, useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { BarcodeScanningResult, CameraView } from "expo-camera";

import { Modal, View } from "components";

const { height, width } = Dimensions.get("window");
const minDimension = Math.min(height, width);

const styleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camStyle: {
    width: "100%",
    height: "100%",
  },
});

type QrScannerModalProps = {
  onData: (data: string) => Promise<void>;
  onDismiss: () => void;
};

export const QrScannerModal = (props: QrScannerModalProps) => {
  const { onData, onDismiss } = props;

  const cameraViewStyle = useMemo(
    () =>
      StyleSheet.compose(styleSheet.camStyle, {
        height: minDimension,
        width: minDimension,
      }),
    [],
  );

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const { data } = result;
      await onData(data);
    },
    [onData],
  );

  return (
    <Modal
      onDismiss={onDismiss}
      titleKey="dataEntry:coordinate.navigateToTarget"
    >
      <View style={styleSheet.container}>
        <CameraView
          style={cameraViewStyle}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={onBarcodeScanned}
        />
      </View>
    </Modal>
  );
};
