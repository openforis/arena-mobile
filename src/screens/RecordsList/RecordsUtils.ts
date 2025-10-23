import {
  NodeDefs,
  NodeValueFormatter,
  Objects,
  Surveys,
} from "@openforis/arena-core";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { SurveyDefs } from "model";

const getValuesByKeyOrSummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  valuesWrapperProp,
  t = null
}: any) => {
  const { cycle } = recordSummary;
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const nodeDefs =
    valuesWrapperProp === "keysObj"
      ? SurveyDefs.getRootKeyDefs({ survey, cycle })
      : Surveys.getNodeDefsIncludedInMultipleEntitySummary({
          survey,
          cycle,
          nodeDef: rootDef,
        });
  return nodeDefs.reduce((acc: any, nodeDef: any) => {
    const nodeDefName = NodeDefs.getName(nodeDef);
    const value = Objects.path([valuesWrapperProp, nodeDefName])(recordSummary);
    // @ts-expect-error TS(2345): Argument of type '{ survey: any; nodeDef: any; val... Remove this comment to see the full error message
    let valueFormatted = NodeValueFormatter.format({
      survey,
      nodeDef: nodeDef,
      value,
      showLabel: true,
      lang,
    });
    if (Objects.isEmpty(valueFormatted)) {
      if (Objects.isEmpty(value)) {
        valueFormatted = t ? t("common:empty") : null;
      } else {
        valueFormatted = String(value);
      }
    }
    acc[nodeDefName] = valueFormatted;
    return acc;
  }, {});
};

const getValuesByKeyFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null
}: any) =>
  getValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "keysObj",
    t,
  });

const getValuesBySummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null
}: any) =>
  getValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "summaryAttributesObj",
    t,
  });

export const RecordsUtils = {
  getValuesByKeyFormatted,
  getValuesBySummaryAttributeFormatted,
};
