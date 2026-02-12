import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Arrays } from "@openforis/arena-core";

import { ConfirmActions, ConfirmState, OnConfirmParams } from "./reducer";
import { useAppDispatch } from "state/store";

type ConfirmDialogLocalState = {
  confirmButtonEnabled: boolean;
  selectedMultipleChoiceValues: any[];
  selectedSingleChoiceValue: any;
  swipeConfirmed: boolean;
  textInputValue: string;
};

const defaultLocalState: ConfirmDialogLocalState = {
  confirmButtonEnabled: true,
  selectedMultipleChoiceValues: [],
  selectedSingleChoiceValue: null,
  swipeConfirmed: false,
  textInputValue: "",
};

export const useConfirmDialog = (): ConfirmState &
  ConfirmDialogLocalState & {
    confirm: () => void;
    cancel: () => void;
    onMultipleChoiceOptionChange: (value: any) => void;
    onSingleChoiceOptionChange: (value: any) => void;
    onTextInputChange: (value: string) => void;
    setSwipeConfirmed: () => void;
  } => {
  const dispatch = useAppDispatch();

  const confirmState: ConfirmState = useSelector((state: any) => state.confirm);

  const { confirmButtonEnableFn, swipeToConfirm } = confirmState;

  const [state, setState] = useState(defaultLocalState);

  const {
    confirmButtonEnabled,
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    swipeConfirmed,
    textInputValue,
  } = state;

  useEffect(() => {
    setState(() => {
      const confirmParams = {
        selectedMultipleChoiceValues:
          confirmState.defaultMultipleChoiceValues ?? [],
        selectedSingleChoiceValue: confirmState.defaultSingleChoiceValue,
        textInputValue: confirmState.defaultTextInputValue ?? "",
      };
      return {
        ...defaultLocalState,
        ...confirmParams,
        confirmButtonEnabled: confirmButtonEnableFn?.(confirmParams) ?? true,
      };
    });
  }, [confirmButtonEnableFn, confirmState]);

  const getConfirmParams = useCallback(
    (): OnConfirmParams => ({
      selectedMultipleChoiceValues,
      selectedSingleChoiceValue,
      textInputValue,
    }),
    [selectedMultipleChoiceValues, selectedSingleChoiceValue, textInputValue],
  );

  useEffect(() => {
    if (swipeToConfirm || confirmButtonEnableFn) {
      setState((statePrev) => ({
        ...statePrev,
        confirmButtonEnabled:
          (!swipeToConfirm || swipeConfirmed) &&
          (confirmButtonEnableFn?.(getConfirmParams()) ?? true),
      }));
    }
  }, [confirmButtonEnableFn, getConfirmParams, swipeConfirmed, swipeToConfirm]);

  const confirm = useCallback(() => {
    dispatch(ConfirmActions.confirm(getConfirmParams()));
  }, [dispatch, getConfirmParams]);

  const cancel = useCallback(() => {
    dispatch(ConfirmActions.cancel());
  }, [dispatch]);

  const onMultipleChoiceOptionChange = useCallback((value: any) => {
    setState((statePrev) => {
      const prevSelection = statePrev.selectedMultipleChoiceValues ?? [];
      const nextChecked = !prevSelection.includes(value);
      const nextSelection = nextChecked
        ? Arrays.addItem(value)(prevSelection)
        : Arrays.removeItem(value)(prevSelection);
      return {
        ...statePrev,
        selectedMultipleChoiceValues: nextSelection,
      };
    });
  }, []);

  const onSingleChoiceOptionChange = useCallback((value: any) => {
    setState((statePrev) => ({
      ...statePrev,
      selectedSingleChoiceValue: value,
    }));
  }, []);

  const onTextInputChange = useCallback((value: string) => {
    setState((statePrev) => ({
      ...statePrev,
      textInputValue: value,
    }));
  }, []);

  const setSwipeConfirmed = useCallback(() => {
    setState((statePrev) => ({
      ...statePrev,
      swipeConfirmed: true,
    }));
  }, []);

  return {
    ...confirmState,
    confirm,
    confirmButtonEnabled,
    cancel,

    onMultipleChoiceOptionChange,
    onSingleChoiceOptionChange,
    onTextInputChange,
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    setSwipeConfirmed,
    swipeConfirmed,
    textInputValue,
  };
};
