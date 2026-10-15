import { useState } from "react";
import { useSelector } from "react-redux";

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
  const [distanceTarget, setDistanceTarget] = useState(null);
  useSelector((state) => {
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
