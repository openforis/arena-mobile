import {
  Arrays,
  NodeDefs,
  Nodes,
  Records,
  RecordValidations,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { RecordNodes } from "model/utils/RecordNodes";
import { ValidationUtils } from "model/utils/ValidationUtils";

import { DataEntrySelectors, SurveySelectors } from "state";

const getChildEntity = ({ record, entity, currentEntity, childDef }) => {
  if (NodeDefs.isSingle(childDef)) {
    return Records.getChild(entity, childDef.uuid)(record);
  }
  const currentEntityAndAncestorUuids = [
    ...Nodes.getHierarchy(currentEntity),
    currentEntity.uuid,
  ];
  const children = Records.getChildren(entity, childDef.uuid)(record);
  return children.find((child) =>
    currentEntityAndAncestorUuids.includes(child.uuid)
  );
};

const getAncestorAndSelfNodeDefUuids = ({ survey, uuid }) => {
  const result = [];
  let currentNodeDef = Surveys.getNodeDefByUuid({ survey, uuid });
  while (currentNodeDef) {
    result.unshift(currentNodeDef.uuid);
    currentNodeDef = Surveys.getNodeDefParent({
      survey,
      nodeDef: currentNodeDef,
    });
  }
  return result;
};

const _processFieldValidation = ({
  survey,
  record,
  treeItemsById,
  acc,
  fieldValidation,
  validationKey,
}) => {
  if (fieldValidation.valid) return acc;

  if (
    validationKey.startsWith(
      RecordValidations.prefixValidationFieldChildrenCount
    )
  ) {
    const notValidNodeDefUuid = Arrays.last(validationKey.split("_"));
    const notValidNodeDefUuids = getAncestorAndSelfNodeDefUuids({
      survey,
      uuid: notValidNodeDefUuid,
    });
    notValidNodeDefUuids.forEach((uuid) => {
      if (treeItemsById[uuid]) {
        acc.treeItemIdsWithErrors.add(uuid);
      }
    });
  } else {
    const node = Records.getNodeByUuid(validationKey)(record);
    if (!node) return acc;

    const notValidNodeInTree = RecordNodes.findAncestor({
      record,
      node,
      predicate: (visitedAncestor) =>
        !!treeItemsById[visitedAncestor.nodeDefUuid],
    });
    if (notValidNodeInTree) {
      const notValidTreeItemId = notValidNodeInTree.nodeDefUuid;
      if (ValidationUtils.hasNestedErrors(fieldValidation)) {
        acc.treeItemIdsWithErrors.add(notValidTreeItemId);
      } else {
        acc.treeItemIdsWithWarnings.add(notValidTreeItemId);
      }
    }
  }
  return acc;
};

const findNotValidTreeItemIds = ({ survey, record, treeItemsById }) => {
  const validation = Validations.getValidation(record);
  const fieldValidations = Validations.getFieldValidations(validation);
  return Object.entries(fieldValidations).reduce(
    (acc, [validationKey, fieldValidation]) =>
      _processFieldValidation({
        survey,
        record,
        treeItemsById,
        acc,
        fieldValidation,
        validationKey,
      }),
    { treeItemIdsWithErrors: new Set(), treeItemIdsWithWarnings: new Set() }
  );
};

export const useTreeData = () => {
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const record = DataEntrySelectors.useRecord();
  const currentPageEntity = DataEntrySelectors.useCurrentPageEntity();
  const {
    entityDef: currentEntityDef,
    entityUuid,
    parentEntityUuid,
  } = currentPageEntity;

  const currentEntityUuid = entityUuid || parentEntityUuid;
  const currentEntity = Records.getNodeByUuid(currentEntityUuid)(record);
  const { cycle } = record;

  const createTreeItem = ({ nodeDef, parentEntityUuid, entityUuid }) => ({
    id: nodeDef.uuid,
    label: NodeDefs.getLabelOrName(nodeDef, lang),
    isRoot: !parentEntityUuid,
    children: [],
    isCurrentEntity: nodeDef.uuid === currentEntityDef.uuid,
    entityPointer: {
      entityDefUuid: nodeDef.uuid,
      parentEntityUuid,
      entityUuid,
    },
  });

  const rootDef = Surveys.getNodeDefRoot({ survey });
  const rootNode = Records.getRoot(record);

  const rootTreeItem = createTreeItem({
    nodeDef: rootDef,
    parentEntityUuid: null,
    entityUuid: rootNode.uuid,
  });

  const stack = [
    { treeItem: rootTreeItem, entityDef: rootDef, entity: rootNode },
  ];

  const treeItemsById = {};
  treeItemsById[rootDef.uuid] = rootTreeItem;

  while (stack.length) {
    const {
      treeItem: parentTreeItem,
      entityDef: visitedEntityDef,
      entity: visitedEntity,
    } = stack.pop();

    const applicableChildrenEntityDefs =
      RecordNodes.getApplicableChildrenEntityDefs({
        survey,
        nodeDef: visitedEntityDef,
        parentEntity: visitedEntity,
        cycle,
      }).filter(
        (childDef) =>
          Surveys.isNodeDefAncestor({
            nodeDefAncestor: visitedEntityDef,
            nodeDefDescendant: currentEntityDef,
          }) ||
          // is current entity def
          childDef.uuid === currentEntityDef.uuid ||
          // is sibling of current entity def
          childDef.parentUuid === currentEntityDef.parentUuid ||
          // is child of current entity def
          childDef.parentUuid === currentEntityDef.uuid
      );

    applicableChildrenEntityDefs.forEach((childDef) => {
      const childEntity = getChildEntity({
        record,
        entity: visitedEntity,
        childDef,
        currentEntity,
      });

      const treeItem = createTreeItem({
        nodeDef: childDef,
        parentEntityUuid: visitedEntity.uuid,
        entityUuid: childEntity?.uuid,
      });

      parentTreeItem.children.push(treeItem);

      treeItemsById[treeItem.id] = treeItem;

      if (childEntity) {
        stack.push({ treeItem, entityDef: childDef, entity: childEntity });
      }
    });
  }

  const { treeItemIdsWithErrors, treeItemIdsWithWarnings } =
    findNotValidTreeItemIds({ survey, record, treeItemsById });

  treeItemIdsWithErrors.forEach((treeItemId) => {
    treeItemsById[treeItemId].hasErrors = true;
  });
  treeItemIdsWithWarnings.forEach((treeItemId) => {
    treeItemsById[treeItemId].hasWarnings = true;
  });
  return [rootTreeItem];
};
