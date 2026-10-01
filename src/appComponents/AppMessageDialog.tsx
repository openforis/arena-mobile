import React, { useCallback } from "react";
import { useSelector } from "react-redux";

import { MessageDialog } from "../components";
import { MessageActions } from "../state/message";
import { useAppDispatch } from "state/storeHooks";

export const AppMessageDialog = () => {
  const dispatch = useAppDispatch();
  const {
    content,
    contentParams,
    details,
    detailsParams,
    title,
  } = useSelector((state: any) => state.message);

  const onDismiss = useCallback(() => {
    dispatch(MessageActions.dismissMessage());
  }, [dispatch]);

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
