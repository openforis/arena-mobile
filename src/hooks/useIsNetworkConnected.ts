import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useIsNetworkConnected = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfoState) => {
      // @ts-expect-error TS(2345): Argument of type 'boolean | null' is not assignabl... Remove this comment to see the full error message
      setConnected(netInfoState.isConnected);
    });
    return unsubscribe;
  }, []);

  return connected;
};
