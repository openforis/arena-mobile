import { useEffect } from "react";

import { MessageActions } from "state/message";
import { useAppDispatch } from "state/store";
import { log } from "utils/Logger";

type Props = {
  error: any;
  resetError: () => void;
};

export const ErrorFallbackComponent = (props: Props) => {
  const { error, resetError } = props;

  const dispatch = useAppDispatch();

  useEffect(() => {
    log.error(
      "ErrorFallbackComponent caught an error:",
      String(error),
      error.stack,
    );
    dispatch(
      MessageActions.setMessage({
        content: "common:somethingWentWrong",
        contentParams: { error: error.toString() },
        details: error.stack,
        onDismiss: resetError,
        title: "common:error",
      }),
    );
  }, [dispatch, error, resetError]);

  return null;
};
