import { ArenaNodeDef, Objects, Records } from "@openforis/arena-core";

import { useAsyncValueEffect } from "hooks";
import { RecordUtils } from "model/utils/RecordUtils";
import { DataEntrySelectors, SurveySelectors } from "state";

export const useCoordinateDistanceTarget = ({
  nodeDef,
  nodeUuid,
}: {
  nodeDef: ArenaNodeDef<any>;
  nodeUuid: string;
}) => {
  const survey = SurveySelectors.useCurrentSurvey()!;
  const record = DataEntrySelectors.useRecord();

  // evaluated in an effect (not in a selector): async, and only when the record changes
  const [distanceTarget] = useAsyncValueEffect(
    () =>
      RecordUtils.getCoordinateDistanceTarget({
        survey,
        nodeDef,
        record,
        node: Records.getNodeByUuid(nodeUuid)(record),
      }),
    [survey, nodeDef, record, nodeUuid],
    { initialValue: null, isEqual: Objects.isEqual },
  );

  return distanceTarget;
};
