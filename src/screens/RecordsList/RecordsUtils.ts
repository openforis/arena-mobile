import {
  LanguageCode,
  NodeDefs,
  NodeValueFormatter,
  Objects,
  Survey,
  Surveys,
} from "@openforis/arena-core";
import { SurveyDefs } from "model";

const getValuesByKeyOrSummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  valuesWrapperProp,
  t = null,
}: {
  survey: Survey;
  lang: LanguageCode;
  recordSummary: any;
  valuesWrapperProp: string;
  t: any;
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
  return nodeDefs.reduce(
    (acc, nodeDef) => {
      const nodeDefName = NodeDefs.getName(nodeDef);
      const value = Objects.path([valuesWrapperProp, nodeDefName])(
        recordSummary
      );
      let valueFormatted = NodeValueFormatter.format({
        survey,
        cycle,
        nodeDef: nodeDef,
        value,
        showLabel: true,
        lang,
      });
      if (Objects.isEmpty(valueFormatted)) {
        valueFormatted = Objects.isEmpty(value)
          ? t?.("common:empty")
          : String(value);
      }
      acc[nodeDefName] = valueFormatted;
      return acc;
    },
    {} as Record<string, string>
  );
};

const getValuesByKeyFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null,
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
  t = null,
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
