import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectToastContent = (state: RootState) => state.toast;

export const ToastSelectors = {
  selectToastContent,

  useToastContent: () => useAppSelector(selectToastContent),
};
