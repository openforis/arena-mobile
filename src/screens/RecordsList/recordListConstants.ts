import { RecordLoadStatus, RecordOrigin } from "model";

const iconByLoadStatus: Record<RecordLoadStatus, string> = {
  [RecordLoadStatus.complete]: "circle-slice-8",
  [RecordLoadStatus.partial]: "circle-slice-4",
  [RecordLoadStatus.summary]: "circle-outline",
};

const iconByOrigin: Record<RecordOrigin, string> = {
  [RecordOrigin.local]: "cellphone",
  [RecordOrigin.remote]: "cloud-outline",
};

export const RecordListConstants = {
  iconByLoadStatus,
  iconByOrigin,
};
