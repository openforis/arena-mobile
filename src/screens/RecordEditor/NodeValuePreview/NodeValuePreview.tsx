import React from "react";
import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Objects,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

import { CoordinateValuePreview } from "./CoordinateValuePreview";
import { BooleanValuePreview } from "./BooleanValuePreview";
import { FileValuePreview } from "./FileValuePreview";
import { TaxonValuePreview } from "./TaxonValuePreview";

const componentByNodeDefType = {
  [NodeDefType.boolean]: BooleanValuePreview,
  [NodeDefType.coordinate]: CoordinateValuePreview,
  [NodeDefType.file]: FileValuePreview,
  [NodeDefType.taxon]: TaxonValuePreview,
};

export const NodeValuePreview = (props: any) => {
  const { nodeDef, value } = props;

  if (__DEV__) {
    console.log(`rendering NodeValuePreview for ${NodeDefs.getName(nodeDef)}`);
  }

  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  if (Objects.isEmpty(value)) {
    return <Text>---</Text>;
  }

  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const component = componentByNodeDefType[nodeDef.type];
  if (component) {
    return React.createElement(component, { nodeDef, value });
  }
  // @ts-expect-error TS(2345): Argument of type '{ survey: any; nodeDef: any; val... Remove this comment to see the full error message
  const valueFormatted = NodeValueFormatter.format({
    survey,
    nodeDef,
    value,
    showLabel: true,
    lang,
  });
  return <Text>{valueFormatted}</Text>;
};

NodeValuePreview.propTypes = NodeValuePreviewPropTypes;
