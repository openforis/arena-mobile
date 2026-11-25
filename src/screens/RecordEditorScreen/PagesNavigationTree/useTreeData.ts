import { useMemo } from "react";

import {
  LanguageCode,
  ArenaAnyNodeDef,
  ArenaNodeDefEntity,
  ArenaRecordNode,
  NodeDefs,
  RecordNodes,
  Records,
  RecordValidations,
  ArenaSurvey,
  Surveys,
  ArenaValidation,
  Validations,
} from "@openforis/arena-core";

import {
  ArenaMobileRecord,
  RecordCurrentPageEntityPointer,
  RecordUtils,
} from "model";

import { DataEntrySelectors, SettingsSelectors, SurveySelectors } from "state";

type TreeValidationAccumulator = {
  treeItemIdsWithErrors: Set<string>;
  treeItemIdsWithWarnings: Set<string>;
};

type TreeItemsById = Record<string, TreeItem>;

const getChildEntity = ({
  record,
  entity,
  currentEntity,
  childDef,
}: {
  record: ArenaMobileRecord;
  entity: ArenaRecordNode;
  currentEntity: ArenaRecordNode;
  childDef: ArenaAnyNodeDef;
}) => {
  if (NodeDefs.isSingle(childDef)) {
    return Records.getChild(entity, childDef.uuid)(record);
  }
  const currentEntityAndAncestorUuids = new Set([
    ...RecordNodes.getHierarchy(currentEntity),
    currentEntity.uuid,
  ]);
  const children = Records.getChildren(entity, childDef.uuid)(record);
  return children.find((child) =>
    currentEntityAndAncestorUuids.has(child.uuid),
  );
};

const processChildrenCountValidation = ({
  survey,
  validationKey,
  treeItemsById,
  acc,
}: {
  survey: ArenaSurvey;
  validationKey: string;
  treeItemsById: TreeItemsById;
  acc: TreeValidationAccumulator;
}) => {
  const notValidNodeDefUuid =
    RecordValidations.extractValidationChildrenCountKeyNodeDefUuid(
      validationKey,
    );
  const notValidNodedef = Surveys.getNodeDefByUuid({
    survey,
    uuid: notValidNodeDefUuid,
  });
  Surveys.visitAncestorsAndSelfNodeDef({
    survey,
    nodeDef: notValidNodedef,
    visitor: (ancestorNodeDef) => {
      if (treeItemsById[ancestorNodeDef.uuid]) {
        acc.treeItemIdsWithErrors.add(ancestorNodeDef.uuid);
      }
    },
  });
};

const _processFieldValidation = ({
  survey,
  record,
  treeItemsById,
  acc,
  fieldValidation,
  validationKey,
}: {
  survey: ArenaSurvey;
  record: ArenaMobileRecord;
  treeItemsById: TreeItemsById;
  acc: TreeValidationAccumulator;
  fieldValidation: ArenaValidation;
  validationKey: string;
}) => {
  if (fieldValidation.valid) return acc;

  if (RecordValidations.isValidationChildrenCountKey(validationKey)) {
    processChildrenCountValidation({
      survey,
      validationKey,
      treeItemsById,
      acc,
    });
  } else {
    const node = Records.getNodeByUuid(validationKey)(record);
    if (!node) return acc;

    const notValidNodeInTree = RecordUtils.findAncestor({
      record,
      node,
      predicate: (visitedAncestor) =>
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

const findNotValidTreeItemIds = ({
  survey,
  record,
  treeItemsById,
}: {
  survey: ArenaSurvey;
  record: ArenaMobileRecord;
  treeItemsById: TreeItemsById;
}) => {
  const validation = Validations.getValidation(record);
  const fieldValidations = Validations.getFieldValidations(validation);
  const acc: TreeValidationAccumulator = {
    treeItemIdsWithErrors: new Set<string>(),
    treeItemIdsWithWarnings: new Set<string>(),
  };
  for (const [validationKey, fieldValidation] of Object.entries(
    fieldValidations,
  )) {
    _processFieldValidation({
      survey,
      record,
      treeItemsById,
      acc,
      fieldValidation,
      validationKey,
    });
  }
  return acc;
};

export type TreeItem = {
  id: string;
  name: string;
  iconName: string;
  isRoot: boolean;
  children: TreeItem[];
  isCurrentEntity: boolean;
  entityPointer: RecordCurrentPageEntityPointer;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  completionPercent?: number;
};

type CreateTreeItemParams = {
  nodeDef: ArenaAnyNodeDef;
  parentEntityUuid?: string;
  entityUuid?: string;
};

const createChildTreeItem = ({
  survey,
  record,
  visitedEntity,
  childDef,
  currentEntity,
  createTreeItem,
  showRecordCompletion,
}: {
  survey: ArenaSurvey;
  record: ArenaMobileRecord;
  visitedEntity: ArenaRecordNode;
  childDef: ArenaAnyNodeDef;
  currentEntity: ArenaRecordNode;
  createTreeItem: (params: CreateTreeItemParams) => TreeItem;
  showRecordCompletion: boolean;
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

  if (showRecordCompletion) {
    treeItem.completionPercent = RecordUtils.getChildEntityCompletionPercent({
      survey,
      record,
      parentEntity: visitedEntity,
      childDef,
      childEntity,
    });
  }

  return { treeItem, childEntity };
};

const isChildDefIncluded =
  ({
    visitedEntityDef,
    currentEntityDef,
  }: {
    visitedEntityDef: ArenaNodeDefEntity;
    currentEntityDef: ArenaNodeDefEntity;
  }) =>
  (childDef: ArenaAnyNodeDef): boolean =>
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

const buildTreeData = ({
  survey,
  lang,
  record,
  currentEntityDef,
  entityUuid,
  parentEntityUuid,
  showRecordCompletion,
}: {
  survey: ArenaSurvey;
  lang: LanguageCode;
  record: ArenaMobileRecord;
  currentEntityDef: ArenaNodeDefEntity;
  entityUuid?: string;
  parentEntityUuid?: string;
  showRecordCompletion: boolean;
}): TreeItem[] => {
  const currentEntityUuid = (entityUuid ?? parentEntityUuid)!;
  const currentEntity = Records.getNodeByUuid(currentEntityUuid)(record)!;
  const { cycle } = record;

  const getIconName = (nodeDef: ArenaAnyNodeDef): string => {
    if (NodeDefs.isSingle(nodeDef)) return "file-outline";
    if (NodeDefs.isLayoutRenderTypeTable(cycle)(nodeDef as ArenaNodeDefEntity))
      return "table";
    return "content-copy";
  };

  const createTreeItem = ({
    nodeDef,
    parentEntityUuid,
    entityUuid,
  }: CreateTreeItemParams): TreeItem => ({
    id: nodeDef.uuid,
    name: NodeDefs.getLabelOrName(nodeDef, lang),
    iconName: getIconName(nodeDef),
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
    parentEntityUuid: undefined,
    entityUuid: rootNode?.uuid,
  });
  if (rootNode && showRecordCompletion) {
    const rootCompletionStats = Records.getEntityCompletionStats({
      survey,
      record,
      entity: rootNode,
    });
    rootTreeItem.completionPercent =
      RecordUtils.toCompletionPercent(rootCompletionStats);
  }

  const stack = [
    { treeItem: rootTreeItem, entityDef: rootDef, entity: rootNode },
  ] as {
    treeItem: TreeItem;
    entityDef: ArenaNodeDefEntity;
    entity: ArenaRecordNode;
  }[];

  const treeItemsById: Record<string, TreeItem> = {};
  treeItemsById[rootDef.uuid] = rootTreeItem;

  while (stack.length) {
    const {
      treeItem: parentTreeItem,
      entityDef: visitedEntityDef,
      entity: visitedEntity,
    } = stack.pop()!;

    const applicableChildrenEntityDefs =
      RecordUtils.getApplicableChildrenEntityDefs({
        survey,
        nodeDef: visitedEntityDef,
        parentEntity: visitedEntity,
        cycle,
      }).filter(isChildDefIncluded({ visitedEntityDef, currentEntityDef }));

    for (const childDef of applicableChildrenEntityDefs) {
      const { treeItem, childEntity } = createChildTreeItem({
        survey,
        record,
        visitedEntity,
        childDef,
        currentEntity,
        createTreeItem,
        showRecordCompletion,
      });

      parentTreeItem.children.push(treeItem);

      treeItemsById[treeItem.id] = treeItem;

      if (childEntity) {
        stack.push({
          treeItem,
          entityDef: childDef,
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

export const useTreeData = () => {
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const record = DataEntrySelectors.useRecord();
  const {
    entityDef: currentEntityDef,
    entityUuid,
    parentEntityUuid,
  } = DataEntrySelectors.useCurrentPageEntity();
  const showRecordCompletion = SettingsSelectors.useShowRecordCompletion();

  return useMemo(
    () =>
      survey
        ? buildTreeData({
            survey,
            lang,
            record,
            currentEntityDef,
            entityUuid,
            parentEntityUuid,
            showRecordCompletion,
          })
        : [],
    [
      survey,
      lang,
      record,
      currentEntityDef,
      entityUuid,
      parentEntityUuid,
      showRecordCompletion,
    ],
  );
};
