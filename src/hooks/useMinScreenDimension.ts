import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

import { SystemUtils } from "utils/SystemUtils";

export const useMinScreenDimension = () => {
  const [minScreenDimension, setMinScreenDimension] = useState(
    SystemUtils.getMinScreenDimension(),
  );

  useEffect(() => {
    const handleChange = () => {
      setMinScreenDimension(SystemUtils.getMinScreenDimension());
    };
    const subscription = Dimensions.addEventListener("change", handleChange);
    return () => {
      subscription?.remove();
    };
  }, []);

  return minScreenDimension;
};
