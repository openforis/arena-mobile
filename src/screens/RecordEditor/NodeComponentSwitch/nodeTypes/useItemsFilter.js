import { useSelector } from "react-redux";

import {
  NodeDefs,
  Objects,
  RecordExpressionEvaluator,
  Records,
} from "@openforis/arena-core";

import { DataEntrySelectors, SurveySelectors } from "state";

export const useItemsFilter = ({
  nodeDef,
  parentNodeUuid,
  items,
  alwaysIncludeItemFunction = null,
}) =>
  useSelector((state) => {
    const itemsFilter = NodeDefs.getItemsFilter(nodeDef);
    if (items.length === 0 || Objects.isEmpty(itemsFilter) || !parentNodeUuid)
      return items;

    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);
    const expressionEvaluator = new RecordExpressionEvaluator();
    return items.filter((item) => {
      if (alwaysIncludeItemFunction?.(item)) return true;

      try {
        return expressionEvaluator.evalExpression({
          survey,
          record,
          node: parentNode,
          query: itemsFilter,
          item,
        });
      } catch (error) {
        return false;
      }
    });
  }, Objects.isEqual);
