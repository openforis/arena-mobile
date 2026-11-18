import {
  ArenaRecord,
  RecordValidations,
  Records,
  Validations,
} from "@openforis/arena-core";

const findMatchingEntityUuidForChildrenCountValidation = (params: {
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { validationKey, entityNodeUuids } = params;
  // children count validation key directly references the parent entity
  const parentUuid =
    RecordValidations.extractValidationChildrenCountKeyParentUuid(
      validationKey,
    );
  return parentUuid && entityNodeUuids.has(parentUuid) ? parentUuid : undefined;
};

const findMatchingEntityUuidForNodeValidation = (params: {
  record: ArenaRecord;
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { record, validationKey, entityNodeUuids } = params;
  const node = Records.getNodeByUuid(validationKey)(record);
  if (!node) return undefined;

  if (entityNodeUuids.has(node.uuid)) {
    // validation issue on the entity itself (e.g. duplicate key)
    return node.uuid;
  }
  // validation issue on a direct attribute of the entity: do not bubble
  // up errors/warnings belonging to nested (descendant) entities
  const parentEntity = Records.getParent(node)(record);
  return parentEntity && entityNodeUuids.has(parentEntity.uuid)
    ? parentEntity.uuid
    : undefined;
};

const findMatchingEntityUuid = (params: {
  record: ArenaRecord;
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { record, validationKey, entityNodeUuids } = params;
  return RecordValidations.isValidationChildrenCountKey(validationKey)
    ? findMatchingEntityUuidForChildrenCountValidation({
        validationKey,
        entityNodeUuids,
      })
    : findMatchingEntityUuidForNodeValidation({
        record,
        validationKey,
        entityNodeUuids,
      });
};

const findEntityNodesWithValidationIssues = (params: {
  record: ArenaRecord;
  entityNodeUuids: Set<string>;
}): {
  nodeUuidsWithErrors: Set<string>;
  nodeUuidsWithWarnings: Set<string>;
} => {
  const { record, entityNodeUuids } = params;
  const nodeUuidsWithErrors = new Set<string>();
  const nodeUuidsWithWarnings = new Set<string>();

  const validation = Validations.getValidation(record);
  const fieldValidations = Validations.getFieldValidations(validation);

  for (const [validationKey, fieldValidation] of Object.entries(
    fieldValidations,
  )) {
    if (fieldValidation.valid) continue;

    const matchingEntityUuid = findMatchingEntityUuid({
      record,
      validationKey,
      entityNodeUuids,
    });
    if (!matchingEntityUuid) continue;

    const targetSet = Validations.calculateHasNestedErrors(fieldValidation)
      ? nodeUuidsWithErrors
      : nodeUuidsWithWarnings;
    targetSet.add(matchingEntityUuid);
  }
  return { nodeUuidsWithErrors, nodeUuidsWithWarnings };
};

export const RecordValidationIssues = {
  findEntityNodesWithValidationIssues,
};
