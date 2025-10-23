import {
  NodeDefs,
  NodeValueFormatter,
  Objects,
  Surveys,
} from "@openforis/arena-core";
import { SurveyDefs } from "model";

const getValuesByKeyOrSummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  valuesWrapperProp,
  t = null,
}) => {
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
  return nodeDefs.reduce((acc, nodeDef) => {
    const nodeDefName = NodeDefs.getName(nodeDef);
    const value = Objects.path([valuesWrapperProp, nodeDefName])(recordSummary);
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

const getValuesByKeyFormatted = ({ survey, lang, recordSummary, t = null }) =>
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
  t = null,
}) =>
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
