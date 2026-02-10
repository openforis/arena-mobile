import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Arrays } from "@openforis/arena-core";

import { ConfirmActions, ConfirmState } from "./reducer";
import { useAppDispatch } from "state/store";

type ConfirmDialogLocalState = {
  selectedMultipleChoiceValues: any[];
  selectedSingleChoiceValue: any;
  swipeConfirmed: boolean;
  textInputValue: string;
};

const defaultLocalState: ConfirmDialogLocalState = {
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

  const [state, setState] = useState(defaultLocalState);

  const {
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    swipeConfirmed,
    textInputValue,
  } = state;

  useEffect(() => {
    setState({
      ...defaultLocalState,
      selectedMultipleChoiceValues:
        confirmState.defaultMultipleChoiceValues ?? [],
      selectedSingleChoiceValue: confirmState.defaultSingleChoiceValue,
      textInputValue: confirmState.defaultTextInputValue ?? "",
    });
  }, [confirmState]);

  const confirm = useCallback(() => {
    dispatch(
      ConfirmActions.confirm({
        selectedMultipleChoiceValues,
        selectedSingleChoiceValue,
        textInputValue,
      }),
    );
  }, [
    dispatch,
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    textInputValue,
  ]);

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
