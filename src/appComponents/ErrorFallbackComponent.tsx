import { useEffect } from "react";

import { MessageActions } from "state/message";
import { useDispatch } from "react-redux";

type Props = {
  error: any;
  resetError: () => void;
};

export const ErrorFallbackComponent = (props: Props) => {
  const { error, resetError } = props;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      MessageActions.setMessage({
        content: "common:somethingWentWrong",
        contentParams: { error: error.toString() },
        details: error.stack,
        onDismiss: resetError,
        title: "common:error",
      })
    );
  }, [dispatch, error, resetError]);

  return null;
};
