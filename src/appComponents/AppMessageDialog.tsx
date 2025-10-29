import React, { useCallback } from "react";
import { useSelector } from "react-redux";

import { MessageDialog } from "../components";
import { MessageActions } from "../state/message";
import { useAppDispatch } from "state/store";

export const AppMessageDialog = () => {
  const dispatch = useAppDispatch();
  const {
    content,
    contentParams,
    details,
    detailsParams,
    onDismiss: onDismissProp,
    title,
  } = useSelector((state: any) => state.message);

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
