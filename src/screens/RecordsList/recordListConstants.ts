// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordLoadStatus, RecordOrigin } from "model";

const iconByLoadStatus = {
  [RecordLoadStatus.complete]: "circle-slice-8",
  [RecordLoadStatus.partial]: "circle-slice-4",
  [RecordLoadStatus.summary]: "circle-outline",
};

const iconByOrigin = {
  [RecordOrigin.local]: "cellphone",
  [RecordOrigin.remote]: "cloud-outline",
};

export const RecordListConstants = {
  iconByLoadStatus,
  iconByOrigin,
};
