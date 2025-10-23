import { useState } from "react";
import { useSelector } from "react-redux";

import {
  NodeDefs,
  Objects,
  RecordExpressionEvaluator,
  Records,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntrySelectors, SurveySelectors } from "state";

export const useItemsFilter = ({
  nodeDef,
  parentNodeUuid,
  items,
  alwaysIncludeItemFunction = null
}: any) => {
  const [filteredItems, setFilteredItems] = useState([]);

  return useSelector((state) => {
    const itemsFilter = NodeDefs.getItemsFilter(nodeDef);
    if (items.length === 0 || Objects.isEmpty(itemsFilter) || !parentNodeUuid)
      return items;

    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);
    const expressionEvaluator = new RecordExpressionEvaluator();
    Promise.all(
      items.map((item: any) => {
        if (alwaysIncludeItemFunction?.(item)) return true;

        try {
          return expressionEvaluator.evalExpression({
            survey,
            record,
            // @ts-expect-error TS(2322): Type 'Node | undefined' is not assignable to type ... Remove this comment to see the full error message
            node: parentNode,
            // @ts-expect-error TS(2322): Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
            query: itemsFilter,
            item,
          });
        } catch (error) {
          return false;
        }
      })
    ).then((_itemsFilterResults) => {
      const _filteredItems = items.filter(
        (_: any, index: any) => _itemsFilterResults[index]
      );
      if (!Objects.isEqual(_filteredItems, filteredItems)) {
        setFilteredItems(_filteredItems);
      }
    });
    return filteredItems;
  }, Objects.isEqual);
};
