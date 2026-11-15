import { PageNavigationSelectors } from "./selectorsPageNavigation";
import { PreviousCycleSelectors } from "./selectorsPreviousCycle";
import { RecordSelectors } from "./selectorsRecord";
import { RecordNodesSelectors } from "./selectorsRecordNodes";
import { RecordValidationSelectors } from "./selectorsRecordValidation";

export const DataEntrySelectors = {
  ...RecordSelectors,
  ...RecordNodesSelectors,
  ...RecordValidationSelectors,
  ...PageNavigationSelectors,
  ...PreviousCycleSelectors,
};
