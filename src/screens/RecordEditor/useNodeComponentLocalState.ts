import { Objects } from "@openforis/arena-core";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DataEntryActions,
  DataEntrySelectors,
  StoreUtils,
  useAppDispatch,
  useConfirm,
} from "state";
import { Functions } from "utils";

const isNodeValueEqualDefault = (nodeValueA: any, nodeValueB: any) =>
  Objects.isEqual(nodeValueA, nodeValueB) ||
  JSON.stringify(nodeValueA) === JSON.stringify(nodeValueB) ||
  (Objects.isEmpty(nodeValueA) && Objects.isEmpty(nodeValueB));

export const useNodeComponentLocalState = ({
  nodeUuid,
  updateDelay = 0,
  uiValueToNodeValue = Functions.identity,
  nodeValueToUiValue = Functions.identity,
  isNodeValueEqual = isNodeValueEqualDefault,
}: any) => {
  const dispatch = useAppDispatch();
  const debouncedUpdateRef = useRef(null as any);
  const confirm = useConfirm();

  const {
    applicable,
    value: nodeValue,
    validation: nodeValidation,
  } = DataEntrySelectors.useRecordAttributeInfo({
    nodeUuid,
  });

  const [state, setState] = useState({
    // value being updated by the user: keep the UI value until the store is in sync with it
    dirty: false,
    invalidValue: false,
    value: nodeValue,
    uiValue: nodeValueToUiValue(nodeValue),
    validation: nodeValidation,
  });
  const { dirty, invalidValue, value, uiValue, validation } = state;

  // local state synced with the node value during render (not in an effect)
  if (updateDelay) {
    const nodeValueFromUI = uiValueToNodeValue(uiValue);

    if (isNodeValueEqual(nodeValue, nodeValueFromUI)) {
      if (dirty) {
        // node value updated according to user needs: set dirty to false
        setState((statePrev) => ({ ...statePrev, dirty: false }));
      }
    } else if (dirty) {
      // component is dirty (value is being updated by the user): do not update UI using node value
    } else if (!invalidValue) {
      // UI value not in sync with node value: update UI
      const uiValueNext = nodeValueToUiValue(nodeValue);

      // only when changed: it would loop if isNodeValueEqual never matches
      if (
        value !== nodeValue ||
        validation !== nodeValidation ||
        !Objects.isEqual(uiValue, uiValueNext)
      ) {
        setState((statePrev) => ({
          ...statePrev,
          value: nodeValue,
          uiValue: uiValueNext,
          validation: nodeValidation,
        }));
      }
    }
  }

  const updateNodeValue = useCallback(
    ({
      value: uiValueUpdated,
      fileUri = null,
      ignoreDelay = false,
    }: {
      value: any;
      fileUri?: string | null;
      ignoreDelay?: boolean;
    }): Promise<void> => {
      const nodeValueUpdated = uiValueToNodeValue(uiValueUpdated);

      if (
        !Objects.isEmpty(uiValueUpdated) &&
        Objects.isEmpty(nodeValueUpdated)
      ) {
        // inserted value is not valid: do not update record, only UI
        setState((statePrev) => ({
          ...statePrev,
          invalidValue: true,
          uiValue: uiValueUpdated,
        }));
        return Promise.resolve();
      }
      const action = DataEntryActions.updateAttribute({
        uuid: nodeUuid,
        value: nodeValueUpdated,
        fileUri,
      });
      if (updateDelay) {
        // a pending debounced update would overwrite this one
        debouncedUpdateRef.current?.cancel();
        debouncedUpdateRef.current = null;

        setState((statePrev) => ({
          ...statePrev,
          dirty: true,
          invalidValue: false,
          value: nodeValueUpdated,
          uiValue: uiValueUpdated,
          validation: null,
        }));
      }
      if (!ignoreDelay && updateDelay) {
        debouncedUpdateRef.current = StoreUtils.debounceAction(
          action,
          updateDelay,
        );
        dispatch(debouncedUpdateRef.current);
        return Promise.resolve();
      }
      return dispatch(action);
    },
    [uiValueToNodeValue, updateDelay, nodeUuid, dispatch],
  );

  // don't lose the last changes when leaving the node within the update delay
  useEffect(() => () => debouncedUpdateRef.current?.flush(), []);

  const onClearPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:confirmDeleteValue.message",
      })
    ) {
      updateNodeValue({ value: null, ignoreDelay: true });
    }
  }, [confirm, updateNodeValue]);

  return {
    applicable,
    invalidValue,
    value: updateDelay ? value : nodeValue,
    uiValue,
    validation: updateDelay ? validation : nodeValidation,
    updateNodeValue,
    onClearPress,
  };
};
