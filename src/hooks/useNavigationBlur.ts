import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationBlur = (onBlur: () => void) =>
  useNavigationEvent("blur", onBlur);
