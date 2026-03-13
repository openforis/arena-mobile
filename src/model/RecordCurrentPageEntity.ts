import { NodeDefEntity } from "@openforis/arena-core";

export type RecordCurrentPageEntityPointer = {
  parentEntityUuid?: string;
  entityDefUuid: string;
  entityUuid?: string;
  previousCycleParentEntityUuid?: string;
  previousCycleEntityUuid?: string;
};

export type RecordCurrentPageEntity = RecordCurrentPageEntityPointer & {
  entityDef: NodeDefEntity;
};
