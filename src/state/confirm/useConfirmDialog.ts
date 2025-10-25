import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Arrays } from "@openforis/arena-core";

import { ConfirmActions } from "./reducer";

type ConfirmDialogState = {
  selectedMultipleChoiceValues: any[];
  selectedSingleChoiceValue: any;
  swipeConfirmed: boolean;
};

const defaultLocalState: ConfirmDialogState = {
  selectedMultipleChoiceValues: [],
  selectedSingleChoiceValue: null,
  swipeConfirmed: false,
};

export const useConfirmDialog = () => {
  const dispatch = useDispatch();

  const confirmState = useSelector((state: any) => state.confirm);

  const [state, setState] = useState(defaultLocalState);

  const {
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    swipeConfirmed,
  } = state;

  useEffect(() => {
    setState({
      ...defaultLocalState,
      selectedMultipleChoiceValues:
        confirmState.defaultMultipleChoiceValues ?? [],
      selectedSingleChoiceValue: confirmState.defaultSingleChoiceValue,
    });
  }, [confirmState]);

  const confirm = useCallback(() => {
    dispatch(
      ConfirmActions.confirm({
        selectedMultipleChoiceValues,
        selectedSingleChoiceValue,
      }) as never
    );
  }, [dispatch, selectedMultipleChoiceValues, selectedSingleChoiceValue]);

  const cancel = useCallback(() => {
    dispatch(ConfirmActions.cancel() as never);
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
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    setSwipeConfirmed,
    swipeConfirmed,
  };
};
