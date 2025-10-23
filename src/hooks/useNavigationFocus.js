import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationFocus = (onFocus) =>
  useNavigationEvent("focus", onFocus);
