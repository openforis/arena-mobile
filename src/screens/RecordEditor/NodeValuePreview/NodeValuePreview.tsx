import React from "react";
import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Objects,
} from "@openforis/arena-core";

import { Text } from "components";
import { SurveySelectors } from "state";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

import { CoordinateValuePreview } from "./CoordinateValuePreview";
import { BooleanValuePreview } from "./BooleanValuePreview";
import { FileValuePreview } from "./FileValuePreview";
import { TaxonValuePreview } from "./TaxonValuePreview";

const componentByNodeDefType: Record<string, any> = {
  [NodeDefType.boolean]: BooleanValuePreview,
  [NodeDefType.coordinate]: CoordinateValuePreview,
  [NodeDefType.file]: FileValuePreview,
  [NodeDefType.taxon]: TaxonValuePreview,
};

export const NodeValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  if (__DEV__) {
    console.log(`rendering NodeValuePreview for ${NodeDefs.getName(nodeDef)}`);
  }

  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  if (!survey || Objects.isEmpty(value)) {
    return <Text>---</Text>;
  }

  const component = componentByNodeDefType[nodeDef.type];
  if (component) {
    return React.createElement(component, { nodeDef, value });
  }
  const valueFormatted = NodeValueFormatter.format({
    survey,
    cycle,
    nodeDef,
    value,
    showLabel: true,
    lang,
  });
  return <Text>{valueFormatted}</Text>;
};
