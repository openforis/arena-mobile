import { useEffect, useState } from "react";

import {
  NodeDef,
  NodeDefs,
  Objects,
  RecordExpressionEvaluator,
  Records,
  User,
} from "@openforis/arena-core";

import {
  DataEntrySelectors,
  RemoteConnectionSelectors,
  SurveySelectors,
} from "state";
import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";
import { useAppSelector } from "state/storeHooks";

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

  // selectLoggedUserSafe returns a new object on every call when not logged in
  const loggedUser = useAppSelector(RemoteConnectionSelectors.selectLoggedUser);
  const survey = useAppSelector(SurveySelectors.selectCurrentSurvey)!;
  const record = useAppSelector(DataEntrySelectors.selectRecord);
  const prevCycleRecord = useAppSelector(
    DataEntrySelectors.selectPreviousCycleRecord,
  );

  const itemsFilter = NodeDefs.getItemsFilter(nodeDef);
  const filterEnabled =
    items.length > 0 && !Objects.isEmpty(itemsFilter) && !!parentNodeUuid;

  useEffect(() => {
    if (!filterEnabled) return;
    let cancelled = false;
    const user = loggedUser ?? ({ props: {} } as User);
    const parentNode = Records.getNodeByUuid(parentNodeUuid!)(record);
    const expressionEvaluator = new RecordExpressionEvaluator();
    void Promise.all(
      items.map(async (item: any) => {
        if (alwaysIncludeItemFunction?.(item)) return true;
        try {
          return await expressionEvaluator.evalExpression({
            user,
            survey,
            areaOfInterestProvider: AreaOfInterestProviderDefault,
            record,
            prevCycleRecord,
            node: parentNode!,
            query: itemsFilter!,
            item,
          });
        } catch {
          return false;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const _filteredItems = items.filter((_, index) => !!results[index]);
      setFilteredItems((prev) =>
        Objects.isEqual(prev, _filteredItems) ? prev : _filteredItems,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [
    alwaysIncludeItemFunction,
    filterEnabled,
    items,
    itemsFilter,
    loggedUser,
    parentNodeUuid,
    prevCycleRecord,
    record,
    survey,
  ]);

  return filterEnabled ? filteredItems : items;
};
