import {
  ArenaCategoryItem,
  ArenaAnyNodeDef,
  NodeDefs,
  Objects,
  RecordExpressionEvaluator,
  Records,
  ArenaTaxon,
  ArenaUser,
} from "@openforis/arena-core";

import { useAsyncValueEffect } from "hooks";
import {
  DataEntrySelectors,
  RemoteConnectionSelectors,
  SurveySelectors,
} from "state";
import { AreaOfInterestProviderDefault } from "service/areaOfInterestProvider";
import { useAppSelector } from "state/storeHooks";

export const useItemsFilter = <T extends ArenaCategoryItem | ArenaTaxon>({
  nodeDef,
  parentNodeUuid,
  items,
  alwaysIncludeItemFunction = undefined,
}: {
  nodeDef: ArenaAnyNodeDef;
  parentNodeUuid?: string;
  items: T[];
  alwaysIncludeItemFunction?: (item: T) => boolean;
}) => {
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

  const [filteredItems] = useAsyncValueEffect(
    () => {
      const user = loggedUser ?? ({ props: {} } as ArenaUser);
      const parentNode = Records.getNodeByUuid(parentNodeUuid!)(record);
      const expressionEvaluator = new RecordExpressionEvaluator();
      return Promise.all(
        items.map(async (item) => {
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
      ).then((results) => items.filter((_, index) => !!results[index]));
    },
    [
      alwaysIncludeItemFunction,
      items,
      itemsFilter,
      loggedUser,
      parentNodeUuid,
      prevCycleRecord,
      record,
      survey,
    ],
    {
      enabled: filterEnabled,
      initialValue: [] as T[],
      isEqual: Objects.isEqual,
    },
  );

  return filterEnabled ? filteredItems : items;
};
