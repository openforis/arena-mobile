import { useCallback, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { MessageActions, RemoteConnectionActions, useAppDispatch } from "state";

import { parseLoginQrCodeData } from "./remoteConnectionUtils";

// waits for the scanner modal to close
const QR_SCANNER_CLOSE_DELAY_MS = 500;

export const useQrCodeLogin = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const [qrScannerVisible, setQrScannerVisible] = useState(false);

  const onScanQrCode = useCallback(() => setQrScannerVisible(true), []);

  const onQrScannerDismiss = useCallback(() => setQrScannerVisible(false), []);

  const onQrScannerData = useCallback(
    async (data: string) => {
      setQrScannerVisible(false);
      setLoading(true);
      await new Promise<void>((resolve) =>
        setTimeout(resolve, QR_SCANNER_CLOSE_DELAY_MS),
      );
      try {
        const { serverUrl, token } = parseLoginQrCodeData(data);
        await dispatch(
          RemoteConnectionActions.loginWithTempAuthToken({
            token,
            serverUrl,
            navigator,
            showBack: true,
          }),
        );
      } catch {
        dispatch(
          MessageActions.setMessage({
            content: "settingsRemoteConnection:qrCodeNotValid",
          }),
        );
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigator, setLoading],
  );

  return {
    qrScannerVisible,
    onScanQrCode,
    onQrScannerDismiss,
    onQrScannerData,
  };
};
