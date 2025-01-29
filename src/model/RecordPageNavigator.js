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

const getNextOrPrevSiblingEntityPointer = ({
  survey,
  record,
  entityDef,
  parentEntity,
  offset,
  entityUuid = null,
}) => {
  const parentEntityDef = Surveys.getNodeDefParent({
    survey,
    nodeDef: entityDef,
  });

  if (!parentEntityDef) {
    return null;
  }

  const { cycle } = record;
  const entity = entityUuid ? Records.getNodeByUuid(entityUuid)(record) : null;

  if (NodeDefs.isMultiple(entityDef) && entity) {
    // go back to list of entities
    return null;
  }
  const siblingEntityDefs = RecordNodes.getApplicableChildrenEntityDefs({
    survey,
    nodeDef: parentEntityDef,
    parentEntity,
    cycle,
  });
  const currentEntityDefIndex = siblingEntityDefs.indexOf(entityDef);
  const siblingEntityDef = siblingEntityDefs[currentEntityDefIndex + offset];

  if (siblingEntityDef)
    return {
      parentEntityUuid: parentEntity.uuid,
      entityDef: siblingEntityDef,
      entityUuid: getSingleChildNodeUuid({
        record,
        entityDef: siblingEntityDef,
        parentEntity,
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
  });
  if (prevPointer !== null) {
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
