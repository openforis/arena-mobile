import { RecordApplicability } from "./RecordApplicability";
import { RecordAttributeValues } from "./RecordAttributeValues";
import { RecordCompletion } from "./RecordCompletion";
import { RecordKeysFormatter } from "./RecordKeysFormatter";
import { RecordNodeTree } from "./RecordNodeTree";
import { RecordValidationIssues } from "./RecordValidationIssues";
import { RecordValueFormatters } from "./RecordValueFormatters";

export const RecordUtils = {
  formatBooleanValue: RecordValueFormatters.formatBooleanValue,
  getEntityKeysFormatted: RecordKeysFormatter.getEntityKeysFormatted,
  getRootEntityKeysFormatted: RecordKeysFormatter.getRootEntityKeysFormatted,
  getEntitySummaryValuesByNameFormatted:
    RecordKeysFormatter.getEntitySummaryValuesByNameFormatted,
  getAncestorsLabelAndKeysText:
    RecordKeysFormatter.getAncestorsLabelAndKeysText,
  getRecordSummaryValuesByKeyFormatted:
    RecordKeysFormatter.getRecordSummaryValuesByKeyFormatted,
  getRecordSummaryValuesBySummaryAttributeFormatted:
    RecordKeysFormatter.getRecordSummaryValuesBySummaryAttributeFormatted,
  getApplicableChildrenEntityDefs:
    RecordApplicability.getApplicableChildrenEntityDefs,
  getChildEntityCompletionPercent:
    RecordCompletion.getChildEntityCompletionPercent,
  toCompletionPercent: RecordCompletion.toCompletionPercent,
  getSiblingNode: RecordNodeTree.getSiblingNode,
  getCoordinateDistanceTarget:
    RecordAttributeValues.getCoordinateDistanceTarget,
  findAncestor: RecordNodeTree.findAncestor,
  findEntityNodesWithValidationIssues:
    RecordValidationIssues.findEntityNodesWithValidationIssues,
  cleanupAttributeValue: RecordAttributeValues.cleanupAttributeValue,
  hasDescendantApplicableNodes:
    RecordApplicability.hasDescendantApplicableNodes,
  getApplicableDescendantDefs: RecordApplicability.getApplicableDescendantDefs,
  getApplicableSummaryDefs: RecordApplicability.getApplicableSummaryDefs,
};
