import { useEffect } from "react";

import { useNavigator } from "navigation/navigator";

export const useNavigationEvent = (
  type: "focus" | "blur",
  handler: () => void,
) => {
  const navigator = useNavigator();

  useEffect(
    () => navigator.addListener(type, handler),
    [handler, navigator, type],
  );
};
