import React from "react";

import { NodeDef } from "@openforis/arena-core";

import { OpenMapButton } from "components";
import { SurveySelectors } from "state";
import { useCoordinateDistanceTarget } from "./useCoordinateDistanceTarget";

type Props = {
  nodeDef: NodeDef<any>;
  nodeUuid: string;
};

export const CoordinateTargetMapButton = (props: Props) => {
  const { nodeDef, nodeUuid } = props;
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const targetPoint = useCoordinateDistanceTarget({ nodeDef, nodeUuid });
  if (!targetPoint) return null;
  return (
    <OpenMapButton
      icon="map-marker-radius"
      point={targetPoint}
      srsIndex={srsIndex}
      testID="coordinate-open-target-map-button"
    />
  );
};
