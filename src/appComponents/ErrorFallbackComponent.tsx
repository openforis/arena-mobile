import { useEffect } from "react";

import { MessageActions } from "state/message";
import { useAppDispatch } from "state/store";

type Props = {
  error: any;
  resetError: () => void;
};

export const ErrorFallbackComponent = (props: Props) => {
  const { error, resetError } = props;

  const dispatch = useAppDispatch();

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
