import { useState } from "react";

import { NodeDef, Objects, Records } from "@openforis/arena-core";

import { RecordUtils } from "model/utils/RecordUtils";
import { DataEntrySelectors, SurveySelectors } from "state";
import { useAppSelector } from "state/storeHooks";

export const useCoordinateDistanceTarget = ({
  nodeDef,
  nodeUuid,
}: {
  nodeDef: NodeDef<any>;
  nodeUuid: string;
}) => {
  const survey = SurveySelectors.useCurrentSurvey()!;
  const [distanceTarget, setDistanceTarget] = useState(null);
  useAppSelector((state) => {
    const record = DataEntrySelectors.selectRecord(state);
    const node = Records.getNodeByUuid(nodeUuid)(record);
    void RecordUtils.getCoordinateDistanceTarget({
      survey,
      nodeDef,
      record,
      node,
    }).then((_distanceTarget) => {
      if (!Objects.isEqual(_distanceTarget, distanceTarget)) {
        setDistanceTarget(_distanceTarget);
      }
    });
  }, Objects.isEqual);
  return distanceTarget;
};
