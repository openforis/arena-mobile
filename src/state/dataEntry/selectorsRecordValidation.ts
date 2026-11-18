import {
  Objects,
  Records,
  RecordValidations,
  Validation,
  Validations,
} from "@openforis/arena-core";

import { createSelector } from "@reduxjs/toolkit";

import { RecordUtils } from "model";

import { SurveySelectors } from "../survey/selectors";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";
import { NodePointerParams, selectRecordUnsafe } from "./selectorsRecord";

const selectRecordNodePointerValidation =
  (state: RootState) =>
  ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams): Validation | undefined => {
    if (!parentNodeUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const nodeParent = Records.getNodeByUuid(parentNodeUuid)(record)!;
    const nodes = Records.getChildren(nodeParent, nodeDefUuid)(record);
    if (nodes.length === 0) return undefined;

    const node = nodes[0]!;
    const validation = RecordValidations.getValidationNode({
      nodeUuid: node.uuid,
    })(record.validation!);
    return validation;
  };

const selectRecordNodePointerValidationChildrenCount =
  ({ parentNodeUuid, nodeDefUuid }: NodePointerParams) =>
  (state: RootState): Validation | undefined => {
    if (!parentNodeUuid) {
      return undefined;
    }
    const record = selectRecordUnsafe(state);
    if (!record) {
      return undefined;
    }
    const validationChildrenCount =
      RecordValidations.getValidationChildrenCount({
        nodeParentUuid: parentNodeUuid,
        nodeDefChildUuid: nodeDefUuid,
      })(record.validation!);
    return validationChildrenCount;
  };

const selectRecordIsNotValid = (state: RootState): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.isNotValid(validation);
};

const selectRecordHasErrors = (state: RootState): boolean => {
  const record = selectRecordUnsafe(state);
  const validation = record ? Validations.getValidation(record) : null;
  return !!validation && Validations.getErrorsCount(validation) > 0;
};

// shared by the progress bars (app bar and drawer): computed once per record change
const selectRecordCompletionPercent = createSelector(
  [SurveySelectors.selectCurrentSurvey, selectRecordUnsafe],
  (survey, record): number => {
    if (!survey || !record) return 0;
    const rootEntity = Records.getRoot(record);
    if (!rootEntity) return 0;
    const completionStats = Records.getEntityCompletionStats({
      survey,
      record,
      entity: rootEntity,
    });
    return RecordUtils.toCompletionPercent(completionStats);
  },
);

export const RecordValidationSelectors = {
  useRecordNodePointerValidation: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(
      (state) =>
        selectRecordNodePointerValidation(state)({
          parentNodeUuid,
          nodeDefUuid,
        }),
      Objects.isEqual,
    ),

  useRecordNodePointerValidationChildrenCount: ({
    parentNodeUuid,
    nodeDefUuid,
  }: NodePointerParams) =>
    useAppSelector(
      selectRecordNodePointerValidationChildrenCount({
        parentNodeUuid,
        nodeDefUuid,
      }),
      Objects.isEqual,
    ),

  useRecordIsNotValid: () => useAppSelector(selectRecordIsNotValid),
  useRecordHasErrors: () => useAppSelector(selectRecordHasErrors),
  useRecordCompletionPercent: () =>
    useAppSelector(selectRecordCompletionPercent),
};
