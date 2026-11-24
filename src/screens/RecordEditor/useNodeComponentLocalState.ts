import { Objects } from "@openforis/arena-core";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type AppDispatch,
  DataEntryActions,
  DataEntrySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { Functions } from "utils";

type UpdateAction = (dispatch: AppDispatch) => Promise<void>;
type DebouncedUpdateAction = ReturnType<
  typeof Functions.debounce<UpdateAction>
>;

type NodeComponentLocalStateParams<NodeValue, UiValue> = {
  // optional in node component props, but always defined for attributes
  nodeUuid: string | undefined;
  updateDelay?: number;
  uiValueToNodeValue?: (uiValue: UiValue | null) => NodeValue | null;
  nodeValueToUiValue?: (nodeValue: NodeValue | null) => UiValue | null;
  isNodeValueEqual?: (
    nodeValueA: NodeValue | null,
    nodeValueB: NodeValue | null,
  ) => boolean;
  clearConfirmMessageKey?: string;
  onClearConfirmed?: () => void;
};

const isNodeValueEqualDefault = (nodeValueA: unknown, nodeValueB: unknown) =>
  Objects.isEqual(nodeValueA, nodeValueB) ||
  JSON.stringify(nodeValueA) === JSON.stringify(nodeValueB) ||
  (Objects.isEmpty(nodeValueA) && Objects.isEmpty(nodeValueB));

// UiValue defaults to NodeValue: without conversion functions, the UI uses the node value as is
export const useNodeComponentLocalState = <NodeValue, UiValue = NodeValue>({
  nodeUuid,
  updateDelay = 0,
  uiValueToNodeValue = Functions.identity as (
    uiValue: UiValue | null,
  ) => NodeValue | null,
  nodeValueToUiValue = Functions.identity as (
    nodeValue: NodeValue | null,
  ) => UiValue | null,
  isNodeValueEqual = isNodeValueEqualDefault,
  clearConfirmMessageKey = "dataEntry:confirmDeleteValue.message",
  onClearConfirmed = undefined,
}: NodeComponentLocalStateParams<NodeValue, UiValue>) => {
  const dispatch = useAppDispatch();
  const debouncedUpdateRef = useRef<DebouncedUpdateAction | null>(null);
  const updateIdRef = useRef(0);
  const confirm = useConfirm();

  const attributeInfo = DataEntrySelectors.useRecordAttributeInfo({
    nodeUuid: nodeUuid!,
  });
  const { applicable, validation: nodeValidation } = attributeInfo;
  const nodeValue = attributeInfo.value as NodeValue | null;

  const createInitialState = () => ({
    nodeUuid,
    // value being updated by the user: keep the UI value until the store is in sync with it
    dirty: false,
    invalidValue: false,
    value: nodeValue,
    uiValue: nodeValueToUiValue(nodeValue),
    validation: nodeValidation,
  });
  const [state, setState] = useState(createInitialState);
  const { dirty, invalidValue, value, uiValue, validation } = state;

  // same component reused for another node (e.g. another entity): don't show the previous node value
  if (state.nodeUuid !== nodeUuid) {
    setState(createInitialState());
  } else if (updateDelay) {
    // local state synced with the node value during render (not in an effect)
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
      value: UiValue | null;
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
      updateIdRef.current += 1;
      const updateId = updateIdRef.current;
      const action: UpdateAction = async (dispatch) => {
        const applied = await dispatch(
          DataEntryActions.updateAttribute({
            uuid: nodeUuid!,
            value: nodeValueUpdated,
            fileUri,
          }),
        );
        // rejected (e.g. sync in progress, not confirmed) and not superseded: show the node value again
        if (!applied && updateIdRef.current === updateId) {
          setState((statePrev) =>
            statePrev.nodeUuid === nodeUuid
              ? { ...statePrev, dirty: false, invalidValue: false }
              : statePrev,
          );
        }
      };
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
        debouncedUpdateRef.current = Functions.debounce(action, updateDelay);
        dispatch(debouncedUpdateRef.current);
        return Promise.resolve();
      }
      return dispatch(action);
    },
    [uiValueToNodeValue, updateDelay, nodeUuid, dispatch],
  );

  // don't lose the last changes when leaving the node (or switching to another one) within the update delay
  useEffect(
    () => () => {
      debouncedUpdateRef.current?.flush();
      debouncedUpdateRef.current = null;
    },
    [nodeUuid],
  );

  const onClearPress = useCallback(async () => {
    if (await confirm({ messageKey: clearConfirmMessageKey })) {
      onClearConfirmed?.();
      await updateNodeValue({ value: null, ignoreDelay: true });
    }
  }, [clearConfirmMessageKey, confirm, onClearConfirmed, updateNodeValue]);

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
