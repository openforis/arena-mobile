import {
  NodeDefs,
  Nodes,
  Records,
  RecordValidations,
  Surveys,
  Validations,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model/utils/RecordNodes' or it... Remove this comment to see the full error message
import { RecordNodes } from "model/utils/RecordNodes";

// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntrySelectors, SurveySelectors } from "state";

const getChildEntity = ({
  record,
  entity,
  currentEntity,
  childDef
}: any) => {
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

const getAncestorAndSelfNodeDefUuids = ({
  survey,
  uuid
}: any) => {
  const result = [];
  let currentNodeDef = Surveys.getNodeDefByUuid({ survey, uuid });
  while (currentNodeDef) {
    result.unshift(currentNodeDef.uuid);
    // @ts-expect-error TS(2322): Type 'NodeDefEntity | undefined' is not assignable... Remove this comment to see the full error message
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
  validationKey
}: any) => {
  if (fieldValidation.valid) return acc;

  if (RecordValidations.isValidationChildrenCountKey(validationKey)) {
    const notValidNodeDefUuid =
      RecordValidations.extractValidationChildrenCountKeyNodeDefUuid(
        validationKey
      );
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
      predicate: (visitedAncestor: any) => !!treeItemsById[visitedAncestor.nodeDefUuid],
    });
    if (notValidNodeInTree) {
      const notValidTreeItemId = notValidNodeInTree.nodeDefUuid;
      if (Validations.calculateHasNestedErrors(fieldValidation)) {
        acc.treeItemIdsWithErrors.add(notValidTreeItemId);
      } else {
        acc.treeItemIdsWithWarnings.add(notValidTreeItemId);
      }
    }
  }
  return acc;
};

const findNotValidTreeItemIds = ({
  survey,
  record,
  treeItemsById
}: any) => {
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

  const createTreeItem = ({
    nodeDef,
    parentEntityUuid,
    entityUuid
  }: any) => ({
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
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    entityUuid: rootNode.uuid,
  });

  const stack = [
    { treeItem: rootTreeItem, entityDef: rootDef, entity: rootNode },
  ];

  const treeItemsById = {};
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  treeItemsById[rootDef.uuid] = rootTreeItem;

  while (stack.length) {
    const {
      // @ts-expect-error TS(2339): Property 'treeItem' does not exist on type '{ tree... Remove this comment to see the full error message
      treeItem: parentTreeItem,
      // @ts-expect-error TS(2339): Property 'entityDef' does not exist on type '{ tre... Remove this comment to see the full error message
      entityDef: visitedEntityDef,
      // @ts-expect-error TS(2339): Property 'entity' does not exist on type '{ treeIt... Remove this comment to see the full error message
      entity: visitedEntity,
    } = stack.pop();

    const applicableChildrenEntityDefs =
      RecordNodes.getApplicableChildrenEntityDefs({
        survey,
        nodeDef: visitedEntityDef,
        parentEntity: visitedEntity,
        cycle,
      }).filter(
        (childDef: any) => Surveys.isNodeDefAncestor({
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

    applicableChildrenEntityDefs.forEach((childDef: any) => {
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

      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      treeItemsById[treeItem.id] = treeItem;

      if (childEntity) {
        stack.push({ treeItem, entityDef: childDef, entity: childEntity });
      }
    });
  }

  const { treeItemIdsWithErrors, treeItemIdsWithWarnings } =
    findNotValidTreeItemIds({ survey, record, treeItemsById });

  treeItemIdsWithErrors.forEach((treeItemId) => {
    // @ts-expect-error TS(2538): Type 'unknown' cannot be used as an index type.
    treeItemsById[treeItemId].hasErrors = true;
  });
  treeItemIdsWithWarnings.forEach((treeItemId) => {
    // @ts-expect-error TS(2538): Type 'unknown' cannot be used as an index type.
    treeItemsById[treeItemId].hasWarnings = true;
  });
  return [rootTreeItem];
};
