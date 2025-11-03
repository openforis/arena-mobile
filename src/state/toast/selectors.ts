import { useSelector } from "react-redux";

const selectToastContent = (state: any) => state.toast;

export const ToastSelectors = {
  selectToastContent,

  useToastContent: () => useSelector(selectToastContent),
};
