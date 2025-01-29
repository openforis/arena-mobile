import { useEffect } from "react";
import PropTypes from "prop-types";

import { MessageActions } from "state/message";
import { useDispatch } from "react-redux";

export const ErrorFallbackComponent = (props) => {
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

ErrorFallbackComponent.propTypes = {
  error: PropTypes.object.isRequired,
  resetError: PropTypes.func.isRequired,
};
