import { Surveys, Records, NodeDefs, Nodes } from "@openforis/arena-core";

import { RecordNodes } from "model/utils/RecordNodes";

const getSingleChildNodeUuid = ({ record, entityDef, parentEntity }) =>
  NodeDefs.isMultiple(entityDef)
    ? null
    : Records.getChild(parentEntity, entityDef.uuid)(record)?.uuid;

const getAncestorMultipleEntity = ({ survey, record, entity }) => {
  let currentEntity = entity;
  let currentEntityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entity.nodeDefUuid,
  });
  while (
    !NodeDefs.isRoot(currentEntityDef) &&
    !NodeDefs.isMultiple(currentEntityDef)
  ) {
    currentEntity = Records.getParent(currentEntity)(record);
    currentEntityDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: currentEntity.nodeDefUuid,
    });
  }
  return currentEntity;
};

const getNextOrPreviousMultipleEntityPointer = ({
  survey,
  record,
  entity,
  offset,
}) => {
  if (Nodes.isRoot(entity)) return null;

  const parentEntity = Records.getParent(entity)(record);
  const entityDefUuid = entity.nodeDefUuid;
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entityDefUuid,
  });
  const { siblingNode, index: siblingIndex } = RecordNodes.getSiblingNode({
    record,
    parentEntity,
    node: entity,
    offset,
  });

  if (siblingNode) {
    return {
      parentEntityUuid: parentEntity.uuid,
      entityDef,
      entityUuid: siblingNode.uuid,
      index: siblingIndex,
    };
  }
  return null;
};

const findSiblingEntityPointer = ({
  survey,
  record,
  cycle,
  parentEntity,
  entityDef,
  offset,
  includeSingleEntities = false,
}) => {
  let visitedParentEntity = parentEntity;
  let visitedEntityDef = entityDef;
  let visitedParentEntityDef = null;

  const getVisitedParentEntityDef = () =>
    Surveys.getNodeDefParent({ survey, nodeDef: visitedEntityDef });

  const getVisitedParentEntity = () =>
    visitedParentEntityDef
      ? Records.getAncestor({
          record,
          node: visitedParentEntity,
          ancestorDefUuid: visitedParentEntityDef.uuid,
        })
      : null;

  while (visitedEntityDef != null && !NodeDefs.isRoot(visitedEntityDef)) {
    visitedParentEntityDef = getVisitedParentEntityDef();
    const siblingEntityDefs = RecordNodes.getApplicableChildrenEntityDefs({
      survey,
      nodeDef: visitedParentEntityDef,
      parentEntity: visitedParentEntity,
      cycle,
      onlyInOwnPage: true,
    });
    const currentEntityDefIndex = siblingEntityDefs.indexOf(visitedEntityDef);
    const siblingEntityDef =
      currentEntityDefIndex >= 0
        ? siblingEntityDefs[currentEntityDefIndex + offset]
        : null;
    if (siblingEntityDef) {
      return { entityDef: siblingEntityDef, parentEntity: visitedParentEntity };
    }
    if (
      NodeDefs.isSingle(visitedParentEntityDef) &&
      !NodeDefs.isRoot(visitedParentEntityDef)
    ) {
      // visit parent entity and find siblings there
      visitedEntityDef = visitedParentEntityDef;
      visitedParentEntityDef = getVisitedParentEntityDef();
      visitedParentEntity = getVisitedParentEntity();
      if (includeSingleEntities) {
        return {
          entityDef: visitedEntityDef,
          parentEntity: visitedParentEntity,
        };
      }
    } else {
      return null;
    }
  }
  return null;
};

const getNextOrPrevSiblingEntityPointer = ({
  survey,
  record,
  entityDef,
  parentEntity,
  offset,
  entityUuid = null,
  includeSingleEntities = false,
}) => {
  if (NodeDefs.isRoot(entityDef)) {
    return null;
  }
  const { cycle } = record;
  const entity = entityUuid ? Records.getNodeByUuid(entityUuid)(record) : null;

  if (NodeDefs.isMultiple(entityDef) && entity) {
    // go back to list of entities
    return null;
  }

  const { entityDef: siblingEntityDef, parentEntity: siblingParentEntity } =
    findSiblingEntityPointer({
      survey,
      record,
      cycle,
      parentEntity,
      entityDef,
      offset,
      includeSingleEntities,
    }) ?? {};

  if (siblingEntityDef)
    return {
      parentEntityUuid: siblingParentEntity.uuid,
      entityDef: siblingEntityDef,
      entityUuid: getSingleChildNodeUuid({
        record,
        entityDef: siblingEntityDef,
        parentEntity: siblingParentEntity,
      }),
    };
  return null;
};

const getFirstChildEntityPointer = ({
  survey,
  record,
  entityDef,
  entityUuid,
  actualEntity,
}) => {
  const { cycle } = record;
  const childrenEntityDefs = RecordNodes.getApplicableChildrenEntityDefs({
    survey,
    nodeDef: entityDef,
    parentEntity: actualEntity,
    cycle,
    onlyInOwnPage: true,
  });

  if (childrenEntityDefs.length > 0) {
    const firstChildEntityDef = childrenEntityDefs[0];
    return {
      parentEntityUuid: entityUuid,
      entityDef: firstChildEntityDef,
      entityUuid: getSingleChildNodeUuid({
        record,
        entityDef: firstChildEntityDef,
        parentEntity: actualEntity,
      }),
    };
  }
  return null;
};

const getNextEntityPointer = ({ survey, record, currentEntityPointer }) => {
  const { parentEntityUuid, entityDef, entityUuid } = currentEntityPointer;

  const parentEntity = parentEntityUuid
    ? Records.getNodeByUuid(parentEntityUuid)(record)
    : null;
  const entity = entityUuid ? Records.getNodeByUuid(entityUuid)(record) : null;
  const actualEntity = entity || parentEntity;

  if (entityUuid) {
    const firstChildEntityPointer = getFirstChildEntityPointer({
      survey,
      record,
      entityDef,
      entityUuid,
      actualEntity,
    });
    if (firstChildEntityPointer) {
      return firstChildEntityPointer;
    }
  }

  if (NodeDefs.isRoot(entityDef)) {
    return null;
  }

  const nextEntityPointer = getNextOrPrevSiblingEntityPointer({
    survey,
    record,
    entityDef,
    entityUuid,
    parentEntity,
    offset: 1,
  });

  if (nextEntityPointer) {
    return nextEntityPointer;
  }

  const ancestorMultipleEntity = getAncestorMultipleEntity({
    survey,
    record,
    entity: actualEntity,
  });
  const ancestorMultipleEntityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: ancestorMultipleEntity.nodeDefUuid,
  });
  if (NodeDefs.isRoot(ancestorMultipleEntityDef)) {
    return null;
  }
  const ancestorMultipleEntityPointer = getNextOrPreviousMultipleEntityPointer({
    survey,
    record,
    entity: ancestorMultipleEntity,
    offset: 1,
  });
  if (ancestorMultipleEntityPointer) {
    return ancestorMultipleEntityPointer;
  }
  return {
    parentEntityUuid: ancestorMultipleEntity.parentUuid,
    entityDef: ancestorMultipleEntityDef,
    entityUuid: null,
  };
};

const getPrevEntityPointer = ({ survey, record, currentEntityPointer }) => {
  const { parentEntityUuid, entityDef, entityUuid } = currentEntityPointer;

  const parentEntityDef = Surveys.getNodeDefParent({
    survey,
    nodeDef: entityDef,
  });

  if (!parentEntityDef) {
    // entityDef is the root entity: no previous pointers to return;
    return null;
  }
  const parentEntity = parentEntityUuid
    ? Records.getNodeByUuid(parentEntityUuid)(record)
    : null;

  const prevPointer = getNextOrPrevSiblingEntityPointer({
    survey,
    record,
    entityDef,
    entityUuid,
    parentEntity,
    offset: -1,
    includeSingleEntities: true,
  });
  if (prevPointer) {
    return prevPointer;
  }
  if (NodeDefs.isMultiple(entityDef) && entityUuid) {
    return {
      parentEntityUuid,
      entityDef,
      entityUuid: null,
    };
  }
  const ancestorEntity = Records.getParent(parentEntity)(record);
  return {
    parentEntityUuid: ancestorEntity?.uuid,
    entityDef: parentEntityDef,
    entityUuid: parentEntityUuid,
  };
};

export const RecordPageNavigator = {
  getNextEntityPointer,
  getPrevEntityPointer,
};
