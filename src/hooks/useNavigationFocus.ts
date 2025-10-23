import { useNavigationEvent } from "./useNavigationEvent";

export const useNavigationFocus = (onFocus: any) => useNavigationEvent("focus", onFocus);
