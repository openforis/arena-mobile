import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MessageDialog } from "../components";
import { MessageActions } from "../state/message";

export const AppMessageDialog = () => {
  const dispatch = useDispatch();
  const {
    content,
    contentParams,
    details,
    detailsParams,
    onDismiss: onDismissProp,
    title,
  } = useSelector((state) => state.message);

  const onDismiss = useCallback(() => {
    onDismissProp?.();
    dispatch(MessageActions.dismissMessage());
  }, [dispatch, onDismissProp]);

  if (!content) return null;

  return (
    <MessageDialog
      content={content}
      contentParams={contentParams}
      details={details}
      detailsParams={detailsParams}
      doneButtonLabel="common:close"
      onDismiss={onDismiss}
      onDone={onDismiss}
      title={title}
    />
  );
};
