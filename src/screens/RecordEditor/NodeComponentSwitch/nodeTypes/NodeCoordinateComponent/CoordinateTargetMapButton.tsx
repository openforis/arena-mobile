import React, { useMemo } from "react";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import { OpenMapButton } from "components";
import { SurveySelectors } from "state";
import { useCoordinateDistanceTarget } from "./useCoordinateDistanceTarget";

type Props = {
  nodeDef: NodeDef<any>;
  size?: number;
  targetPoint: any;
};

export const CoordinateTargetMapButton = (props: Props) => {
  const { nodeDef, size, targetPoint } = props;
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const titleParams = useMemo(
    () => ({ attributeLabel: NodeDefs.getLabelOrName(nodeDef, lang) }),
    [lang, nodeDef],
  );
  if (!targetPoint) return null;
  return (
    <OpenMapButton
      icon="map-marker-radius"
      point={targetPoint}
      size={size}
      srsIndex={srsIndex}
      testID="coordinate-open-target-map-button"
      titleKey="dataEntry:coordinate.map.targetViewerTitle"
      titleParams={titleParams}
    />
  );
};

export const NodeCoordinateTargetMapButton = (props: {
  nodeDef: NodeDef<any>;
  nodeUuid: string;
}) => {
  const { nodeDef, nodeUuid } = props;
  const targetPoint = useCoordinateDistanceTarget({ nodeDef, nodeUuid });
  return (
    <CoordinateTargetMapButton nodeDef={nodeDef} targetPoint={targetPoint} />
  );
};
