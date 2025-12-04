import React, { JSX } from "react";
import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Objects,
} from "@openforis/arena-core";

import { Text } from "components";
import { SurveySelectors } from "state";
import { log } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

import { CoordinateValuePreview } from "./CoordinateValuePreview";
import { BooleanValuePreview } from "./BooleanValuePreview";
import { FileValuePreview } from "./FileValuePreview";
import { TaxonValuePreview } from "./TaxonValuePreview";
import { TextValuePreview } from "./TextValuePreview";

const componentByNodeDefType: Partial<
  Record<NodeDefType, (props: NodeValuePreviewProps) => JSX.Element | null>
> = {
  [NodeDefType.boolean]: BooleanValuePreview,
  [NodeDefType.coordinate]: CoordinateValuePreview,
  [NodeDefType.file]: FileValuePreview,
  [NodeDefType.taxon]: TaxonValuePreview,
  [NodeDefType.text]: TextValuePreview,
};

export const NodeValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  log.debug(`rendering NodeValuePreview for ${NodeDefs.getName(nodeDef)}`);

  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  if (!survey || Objects.isEmpty(value)) {
    return <Text>---</Text>;
  }

  const valueFormatted = NodeValueFormatter.format({
    survey,
    cycle,
    nodeDef,
    value,
    showLabel: true,
    lang,
  });

  const component = componentByNodeDefType[NodeDefs.getType(nodeDef)];
  if (component) {
    return React.createElement(component, { nodeDef, value, valueFormatted });
  }
  return <Text>{valueFormatted}</Text>;
};
