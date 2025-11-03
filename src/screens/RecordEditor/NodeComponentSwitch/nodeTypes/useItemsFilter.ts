import { useState } from "react";
import { useSelector } from "react-redux";

import {
  NodeDef,
  NodeDefs,
  Objects,
  RecordExpressionEvaluator,
  Records,
} from "@openforis/arena-core";

import {
  DataEntrySelectors,
  RemoteConnectionSelectors,
  SurveySelectors,
} from "state";

export const useItemsFilter = ({
  nodeDef,
  parentNodeUuid,
  items,
  alwaysIncludeItemFunction = undefined,
}: {
  nodeDef: NodeDef<any>;
  parentNodeUuid?: string;
  items: any[];
  alwaysIncludeItemFunction?: (item: any) => boolean;
}) => {
  const [filteredItems, setFilteredItems] = useState([] as any[]);

  return useSelector((state) => {
    const itemsFilter = NodeDefs.getItemsFilter(nodeDef);
    if (items.length === 0 || Objects.isEmpty(itemsFilter) || !parentNodeUuid)
      return items;

    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = DataEntrySelectors.selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);
    const expressionEvaluator = new RecordExpressionEvaluator();
    Promise.all(
      items.map((item: any) => {
        if (alwaysIncludeItemFunction?.(item)) return true;

        try {
          return expressionEvaluator.evalExpression({
            user,
            survey,
            record,
            node: parentNode!,
            query: itemsFilter!,
            item,
          });
        } catch (error) {
          return false;
        }
      })
    ).then((_itemsFilterResults) => {
      const _filteredItems = items.filter(
        (_: any, index: any) => !!_itemsFilterResults[index]
      );
      if (!Objects.isEqual(_filteredItems, filteredItems)) {
        setFilteredItems(_filteredItems);
      }
    });
    return filteredItems;
  }, Objects.isEqual);
};
