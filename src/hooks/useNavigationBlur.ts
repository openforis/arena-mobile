import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationBlur = (onBlur: any) => useNavigationEvent("blur", onBlur);
