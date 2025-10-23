import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Arrays } from "@openforis/arena-core";

import { ConfirmActions } from "./reducer";

const defaultLocalState = {
  selectedMultipleChoiceValues: [],
  selectedSingleChoiceValue: null,
  swipeConfirmed: false,
};

export const useConfirmDialog = () => {
  const dispatch = useDispatch();

  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  const confirmState = useSelector((state) => state.confirm);

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
      // @ts-expect-error TS(2345): Argument of type 'AsyncThunkAction<void, void, Asy... Remove this comment to see the full error message
      ConfirmActions.confirm({
        selectedMultipleChoiceValues,
        selectedSingleChoiceValue,
      })
    );
  }, [dispatch, selectedMultipleChoiceValues, selectedSingleChoiceValue]);

  const cancel = useCallback(() => {
    // @ts-expect-error TS(2345): Argument of type 'AsyncThunkAction<void, void, Asy... Remove this comment to see the full error message
    dispatch(ConfirmActions.cancel());
  }, [dispatch]);

  const onMultipleChoiceOptionChange = useCallback((value: any) => {
    // @ts-expect-error TS(2345): Argument of type '(statePrev: { selectedMultipleCh... Remove this comment to see the full error message
    setState((statePrev) => {
      const prevSelection = statePrev.selectedMultipleChoiceValues ?? [];
      // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
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
