import { useEffect, useState } from "react";

import { NodeDef, Objects, Records } from "@openforis/arena-core";

import { RecordUtils } from "model/utils/RecordUtils";
import { DataEntrySelectors, SurveySelectors } from "state";

export const useCoordinateDistanceTarget = ({
  nodeDef,
  nodeUuid,
}: {
  nodeDef: NodeDef<any>;
  nodeUuid: string;
}) => {
  const survey = SurveySelectors.useCurrentSurvey()!;
  const record = DataEntrySelectors.useRecord();
  const [distanceTarget, setDistanceTarget] = useState(null);

  // evaluated in an effect (not in a selector): async, and only when the record changes
  useEffect(() => {
    let cancelled = false;
    const node = Records.getNodeByUuid(nodeUuid)(record);
    void RecordUtils.getCoordinateDistanceTarget({
      survey,
      nodeDef,
      record,
      node,
    }).then((distanceTargetNext) => {
      if (cancelled) return;
      setDistanceTarget((distanceTargetPrev) =>
        Objects.isEqual(distanceTargetPrev, distanceTargetNext)
          ? distanceTargetPrev
          : distanceTargetNext,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [survey, nodeDef, record, nodeUuid]);

  return distanceTarget;
};
