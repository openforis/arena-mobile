import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useIsNetworkConnected = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfoState) => {
      setConnected(netInfoState.isConnected);
    });
    return unsubscribe;
  }, []);

  return connected;
};
