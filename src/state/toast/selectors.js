import { useSelector } from "react-redux";

const selectToastContent = (state) => state.toast;

export const ToastSelectors = {
  selectToastContent,

  useToastContent: () => useSelector(selectToastContent),
};
