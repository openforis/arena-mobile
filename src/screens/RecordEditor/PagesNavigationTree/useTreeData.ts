import {
  NodeDef,
  NodeDefEntity,
  NodeDefs,
  Nodes,
  Records,
  RecordValidations,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { ArenaMobileRecord, RecordNodes } from "model";

import { DataEntrySelectors, SurveySelectors } from "state";

const getChildEntity = ({ record, entity, currentEntity, childDef }: any) => {
  if (NodeDefs.isSingle(childDef)) {
    return Records.getChild(entity, childDef.uuid)(record);
  }
  const currentEntityAndAncestorUuids = new Set([
    ...Nodes.getHierarchy(currentEntity),
    currentEntity.uuid,
  ]);
  const children = Records.getChildren(entity, childDef.uuid)(record);
  return children.find((child) =>
    currentEntityAndAncestorUuids.has(child.uuid)
  );
};

const getAncestorAndSelfNodeDefUuids = ({ survey, uuid }: any) => {
  const result = [];
  let currentNodeDef: NodeDef<any> | undefined = Surveys.getNodeDefByUuid({
    survey,
    uuid,
  });
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
    for (const uuid of notValidNodeDefUuids) {
      if (treeItemsById[uuid]) {
        acc.treeItemIdsWithErrors.add(uuid);
      }
    }
  } else {
    const node = Records.getNodeByUuid(validationKey)(record);
    if (!node) return acc;

    const notValidNodeInTree = RecordNodes.findAncestor({
      record,
      node,
      predicate: (visitedAncestor: any) =>
        !!treeItemsById[visitedAncestor.nodeDefUuid],
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

const findNotValidTreeItemIds = ({ survey, record, treeItemsById }: any) => {
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
    {
      treeItemIdsWithErrors: new Set<string>(),
      treeItemIdsWithWarnings: new Set<string>(),
    }
  );
};

type EntityPointer = {
  entityDefUuid: string;
  parentEntityUuid: string;
  entityUuid: string;
};

type TreeItem = {
  id: string;
  label: string;
  isRoot: boolean;
  children: TreeItem[];
  isCurrentEntity: boolean;
  entityPointer: EntityPointer;
  hasErrors?: boolean;
  hasWarnings?: boolean;
};

const createChildTreeItem = ({
  record,
  visitedEntity,
  childDef,
  currentEntity,
  createTreeItem,
}: {
  record: ArenaMobileRecord;
  visitedEntity: any;
  childDef: NodeDef<any>;
  currentEntity: any;
  createTreeItem: ({ nodeDef, parentEntityUuid, entityUuid }: any) => TreeItem;
}) => {
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
  return { treeItem, childEntity };
};

const isChildDefIncluded =
  ({
    visitedEntityDef,
    currentEntityDef,
  }: {
    visitedEntityDef: NodeDefEntity;
    currentEntityDef: NodeDefEntity;
  }) =>
  (childDef: NodeDef<any>): boolean =>
    Surveys.isNodeDefAncestor({
      nodeDefAncestor: visitedEntityDef,
      nodeDefDescendant: currentEntityDef,
    }) ||
    // is current entity def
    childDef.uuid === currentEntityDef.uuid ||
    // is sibling of current entity def
    childDef.parentUuid === currentEntityDef.parentUuid ||
    // is child of current entity def
    childDef.parentUuid === currentEntityDef.uuid;

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

  if (!survey) return [];

  const currentEntityUuid = (entityUuid ?? parentEntityUuid)!;
  const currentEntity = Records.getNodeByUuid(currentEntityUuid)(record);
  const { cycle } = record;

  const createTreeItem = ({
    nodeDef,
    parentEntityUuid,
    entityUuid,
  }: any): TreeItem => ({
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
    entityUuid: rootNode?.uuid,
  });

  const stack = [
    { treeItem: rootTreeItem, entityDef: rootDef, entity: rootNode },
  ] as { treeItem: TreeItem; entityDef: NodeDefEntity; entity: any }[];

  const treeItemsById: Record<string, TreeItem> = {};
  treeItemsById[rootDef.uuid] = rootTreeItem;

  while (stack.length) {
    const {
      treeItem: parentTreeItem,
      entityDef: visitedEntityDef,
      entity: visitedEntity,
    } = stack.pop()!;

    const applicableChildrenEntityDefs =
      RecordNodes.getApplicableChildrenEntityDefs({
        survey,
        nodeDef: visitedEntityDef,
        parentEntity: visitedEntity,
        cycle,
      }).filter(isChildDefIncluded({ visitedEntityDef, currentEntityDef }));

    for (const childDef of applicableChildrenEntityDefs) {
      const { treeItem, childEntity } = createChildTreeItem({
        record,
        visitedEntity,
        childDef,
        currentEntity,
        createTreeItem,
      });

      parentTreeItem.children.push(treeItem);

      treeItemsById[treeItem.id] = treeItem;

      if (childEntity) {
        stack.push({
          treeItem,
          entityDef: childDef as NodeDefEntity,
          entity: childEntity,
        });
      }
    }
  }

  const { treeItemIdsWithErrors, treeItemIdsWithWarnings } =
    findNotValidTreeItemIds({ survey, record, treeItemsById });

  for (const treeItemId of treeItemIdsWithErrors) {
    const treeItem = treeItemsById[treeItemId];
    if (treeItem) {
      treeItem.hasErrors = true;
    }
  }
  for (const treeItemId of treeItemIdsWithWarnings) {
    const treeItem = treeItemsById[treeItemId];
    if (treeItem) {
      treeItem.hasWarnings = true;
    }
  }
  return [rootTreeItem];
};
