import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationBlur = (onBlur) => useNavigationEvent("blur", onBlur);
