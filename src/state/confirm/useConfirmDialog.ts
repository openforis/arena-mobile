import { useCallback, useMemo, useState } from "react";

import { Arrays } from "@openforis/arena-core";

import {
  ConfirmActions,
  ConfirmCallbacksRegistry,
  ConfirmState,
  OnConfirmParams,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "state/storeHooks";

type ConfirmDialogLocalState = {
  confirmInProgress: boolean;
  selectedMultipleChoiceValues: any[];
  selectedSingleChoiceValue: any;
  swipeConfirmed: boolean;
  textInputValue: string;
};

const defaultLocalState: ConfirmDialogLocalState = {
  confirmInProgress: false,
  selectedMultipleChoiceValues: [],
  selectedSingleChoiceValue: null,
  swipeConfirmed: false,
  textInputValue: "",
};

const createLocalState = (
  confirmState: ConfirmState,
): ConfirmDialogLocalState => ({
  ...defaultLocalState,
  selectedMultipleChoiceValues: confirmState.defaultMultipleChoiceValues ?? [],
  selectedSingleChoiceValue: confirmState.defaultSingleChoiceValue,
  textInputValue: confirmState.defaultTextInputValue ?? "",
});

export const useConfirmDialog = (): ConfirmState &
  ConfirmDialogLocalState & {
    confirmButtonEnabled: boolean;
    confirm: () => void;
    cancel: () => void;
    onMultipleChoiceOptionChange: (value: any) => void;
    onSingleChoiceOptionChange: (value: any) => void;
    onTextInputChange: (value: string) => void;
    setSwipeConfirmed: () => void;
  } => {
  const dispatch = useAppDispatch();

  const confirmState: ConfirmState = useAppSelector((state) => state.confirm);

  const { showId, swipeToConfirm } = confirmState;

  // looked up once per dialog: the callbacks are removed from the registry as soon as the dialog
  // is being confirmed or cancelled
  const confirmButtonEnableFn = useMemo(
    () => ConfirmCallbacksRegistry.get(showId)?.confirmButtonEnableFn,
    [showId],
  );

  const [state, setState] = useState(() => createLocalState(confirmState));
  const [prevConfirmState, setPrevConfirmState] = useState(confirmState);

  if (confirmState !== prevConfirmState) {
    setPrevConfirmState(confirmState);
    setState(createLocalState(confirmState));
  }

  const {
    confirmInProgress,
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    swipeConfirmed,
    textInputValue,
  } = state;

  const getConfirmParams = useCallback(
    (): OnConfirmParams => ({
      selectedMultipleChoiceValues,
      selectedSingleChoiceValue,
      textInputValue,
    }),
    [selectedMultipleChoiceValues, selectedSingleChoiceValue, textInputValue],
  );

  const confirmButtonEnabled =
    (!swipeToConfirm || swipeConfirmed) &&
    (confirmButtonEnableFn?.(getConfirmParams()) ?? true);

  const confirm = useCallback(async () => {
    setState((statePrev) => ({
      ...statePrev,
      confirmInProgress: true,
    }));
    try {
      await dispatch(ConfirmActions.confirm(getConfirmParams()));
    } finally {
      setState((statePrev) => ({
        ...statePrev,
        confirmInProgress: false,
      }));
    }
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
    confirmInProgress,
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
