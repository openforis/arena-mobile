import { NodeDefEntity } from "@openforis/arena-core";

export type RecordCurrentPageEntity = {
  parentEntityUuid?: string;
  entityDef: NodeDefEntity;
  entityDefUuid: string;
  entityUuid: string;
  previousCycleParentEntityUuid?: string;
  previousCycleEntityUuid?: string;
};
