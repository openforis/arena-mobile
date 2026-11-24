import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationFocus = (onFocus: () => void) =>
  useNavigationEvent("focus", onFocus);
