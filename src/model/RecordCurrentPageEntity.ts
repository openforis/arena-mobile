import { NodeDefEntity } from "@openforis/arena-core";

export type RecordCurrentPageEntityPointer = {
  parentEntityUuid?: string | null;
  entityDefUuid: string;
  entityUuid?: string | null;
  previousCycleParentEntityUuid?: string;
  previousCycleEntityUuid?: string;
};

export type RecordCurrentPageEntity = RecordCurrentPageEntityPointer & {
  entityDef: NodeDefEntity;
};
