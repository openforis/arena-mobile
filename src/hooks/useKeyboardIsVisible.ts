import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboardIsVisible = () => {
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardIsVisible(true);
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardIsVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardIsVisible;
};
