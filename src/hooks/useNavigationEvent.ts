import { useEffect, useRef } from "react";

import { useNavigator } from "navigation/navigator";

export const useNavigationEvent = (
  type: "focus" | "blur",
  handler: () => void,
) => {
  const navigator = useNavigator();

  // latest handler read through a ref: an unstable handler must not re-subscribe the listener
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () => navigator.addListener(type, () => handlerRef.current()),
    [navigator, type],
  );
};
