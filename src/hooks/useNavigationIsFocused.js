import { useCallback, useState } from "react";

import { useNavigationFocus } from "./useNavigationFocus";
import { useNavigationBlur } from "./useNavigationBlur";

export const useNavigationIsFocused = () => {
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  useNavigationFocus(onFocus);
  useNavigationBlur(onBlur);

  return focused;
};
